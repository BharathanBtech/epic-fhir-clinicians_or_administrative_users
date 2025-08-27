import { PatientFundingData, FundingSummary, EOBDetails, PractitionerDetails, OrganizationDetails } from '../types/fhir.js';
import { getPatientDetails } from './patientService.js';
import { getPatientCoverage } from './coverageService.js';
import { getExplanationOfBenefits } from './eobService.js';
import { getPractitionerByPatient } from './practitionerService.js';
import { getOrganizationByPatient } from './organizationService.js';
import { calculatePatientResponsibility, calculateCoveredAmount } from '../utils/fhirHelpers.js';

/**
 * Get complete patient funding data including patient details, coverage, EOBs, and funding summary
 */
export async function getPatientFundingSummary(token: string, patientId: string): Promise<PatientFundingData> {
  console.log('🔍 Starting getPatientFundingSummary for patientId:', patientId);
  
  try {
    // Get patient details, coverage, EOBs, practitioners, and organizations in parallel
    console.log('📡 Fetching patient details, coverage, EOBs, practitioners, and organizations...');
    const [patientDetails, coverage, eobs, practitioners, organizations] = await Promise.all([
      getPatientDetails(token, patientId),
      getPatientCoverage(token, patientId),
      getExplanationOfBenefits(token, patientId),
      getPractitionerByPatient(patientId, token),
      getOrganizationByPatient(patientId, token)
    ]);
    
    console.log('✅ Data fetched successfully:');
    console.log('  - Patient details:', patientDetails ? '✅' : '❌');
    console.log('  - Coverage count:', coverage?.length || 0);
    console.log('  - EOBs count:', eobs?.length || 0);
    console.log('  - EOBs IDs:', eobs?.map((eob: any) => eob.id) || []);
    console.log('  - Practitioners count:', practitioners?.length || 0);
    console.log('  - Practitioners data:', practitioners);
    console.log('  - Patient practitioner IDs:', patientDetails.practitionerIds);
    console.log('  - Organizations count:', organizations?.length || 0);
    console.log('  - Organizations data:', organizations);
    console.log('  - Patient organization IDs:', patientDetails.organizationIds);
    
    // Calculate funding summary from EOBs
    const fundingSummary = calculateFundingSummary(eobs);
    
    console.log('💰 Final funding summary:');
    console.log('  - Total Billed: $', fundingSummary.totalBilled);
    console.log('  - Total Covered: $', fundingSummary.totalCovered);
    console.log('  - Patient Responsibility: $', fundingSummary.totalPatientResponsibility);
    console.log('  - Copay: $', fundingSummary.totalCopay);
    console.log('  - Deductible: $', fundingSummary.totalDeductible);
    console.log('  - Remaining Balance: $', fundingSummary.remainingBalance);
    console.log('  - Claim Count: ', fundingSummary.claimCount);
    
    return {
      patient: patientDetails,
      coverage: coverage,
      eobs: eobs,
      practitioners: practitioners,
      organizations: organizations,
      fundingSummary: fundingSummary
    };
  } catch (error) {
    console.error('❌ Error in getPatientFundingSummary:', error);
    throw error;
  }
}

/**
 * Calculate funding summary from EOB data
 */
function calculateFundingSummary(eobs: EOBDetails[]): FundingSummary {
  const fundingSummary: FundingSummary = {
    totalBilled: 0,
    totalCovered: 0,
    totalPatientResponsibility: 0,
    totalCopay: 0,
    totalDeductible: 0,
    remainingBalance: 0,
    claimCount: eobs?.length || 0
  };
  
  console.log('💰 Processing EOBs for funding calculations...');
  
  if (eobs && eobs.length > 0) {
    eobs.forEach((eob: EOBDetails, index: number) => {
      console.log(`  📋 Processing EOB ${index + 1}/${eobs.length}:`, eob.id);
      console.log(`    - Status: ${eob.status}`);
      console.log(`    - Items count: ${eob.item?.length || 0}`);
      
      // Calculate totals from EOB items
      if (eob.item && eob.item.length > 0) {
        eob.item.forEach((item: any, itemIndex: number) => {
          console.log(`    - Item ${itemIndex + 1}: ${item.productOrService || 'Unknown service'}`);
          
          const billedAmount = item.net || 0;
          console.log(`      - Billed amount: $${billedAmount}`);
          
          // Log adjudication details
          if (item.adjudication && item.adjudication.length > 0) {
            console.log(`      - Adjudications:`, item.adjudication.map((adj: any) => ({
              category: adj.category,
              amount: adj.amount,
              reason: adj.reason
            })));
          } else {
            console.log(`      - No adjudications found`);
          }
          
          const coveredAmount = calculateCoveredAmount(item.adjudication);
          const patientResponsibility = calculatePatientResponsibility(item.adjudication);
          
          // Calculate specific categories
          const copayAmount = item.adjudication?.reduce((sum: number, adj: any) => {
            if (adj.category?.toLowerCase().includes('copay')) {
              console.log(`        + Adding copay: $${adj.amount || 0}`);
              return sum + (adj.amount || 0);
            }
            return sum;
          }, 0) || 0;
          
          const deductibleAmount = item.adjudication?.reduce((sum: number, adj: any) => {
            if (adj.category?.toLowerCase().includes('deductible')) {
              console.log(`        + Adding deductible: $${adj.amount || 0}`);
              return sum + (adj.amount || 0);
            }
            return sum;
          }, 0) || 0;
          
          console.log(`      - Calculated amounts:`);
          console.log(`        * Covered: $${coveredAmount}`);
          console.log(`        * Patient responsibility: $${patientResponsibility}`);
          console.log(`        * Copay: $${copayAmount}`);
          console.log(`        * Deductible: $${deductibleAmount}`);
          
          fundingSummary.totalBilled += billedAmount;
          fundingSummary.totalCovered += coveredAmount;
          fundingSummary.totalPatientResponsibility += patientResponsibility;
          fundingSummary.totalCopay += copayAmount;
          fundingSummary.totalDeductible += deductibleAmount;
        });
      } else {
        console.log(`    - No items found in EOB`);
      }
    });
  } else {
    console.log('⚠️  No EOBs found for this patient');
  }
  
  fundingSummary.remainingBalance = fundingSummary.totalPatientResponsibility - fundingSummary.totalCopay - fundingSummary.totalDeductible;
  
  return fundingSummary;
}
