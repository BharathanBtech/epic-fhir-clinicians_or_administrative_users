import { PatientFundingData, FundingSummary, EOBDetails, PractitionerDetails, OrganizationDetails } from '../types/fhir.js';
import { getPatientDetails } from './patientService.js';
import { getPatientCoverage } from './coverageService.js';
import { getExplanationOfBenefits } from './eobService.js';
import { getPractitionerByPatient } from './practitionerService.js';
import { getOrganizationByPatient } from './organizationService.js';
import { calculatePatientResponsibility, calculateCoveredAmount, getTextFromFHIR } from '../utils/fhirHelpers.js';

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
 * Calculate funding summary from EOB data - Using raw API data directly
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
  
  console.log('💰 Processing EOBs using raw API data...');
  
  if (eobs && eobs.length > 0) {
    eobs.forEach((eob: EOBDetails, index: number) => {
      console.log(`  📋 Processing EOB ${index + 1}/${eobs.length}:`, eob.id);
      console.log(`    - Status: ${eob.status}`);
      console.log(`    - API totals available: ${eob.total?.length || 0}`);
      
      // Simply use the raw API totals without complex calculations
      if (eob.total && eob.total.length > 0) {
        console.log(`    - Raw EOB totals:`, JSON.stringify(eob.total, null, 2));
        
        // Map each total directly to the appropriate field
        eob.total.forEach((total: any) => {
          const categoryCode = total.categoryCode || '';
          const amount = total.amount || 0;
          
          console.log(`    - Processing total: category="${total.category}", code="${categoryCode}", amount=$${amount}`);
          
          // Map based on category code or text
          if (categoryCode === 'submitted' || total.category?.toLowerCase().includes('submitted')) {
            fundingSummary.totalBilled += amount;
            console.log(`      ✅ Added to Total Billed: $${amount}`);
          } else if (categoryCode === 'benefit' || total.category?.toLowerCase().includes('benefit')) {
            fundingSummary.totalCovered += amount;
            console.log(`      ✅ Added to Total Covered: $${amount}`);
          } else if (categoryCode === 'copay' || total.category?.toLowerCase().includes('copay')) {
            fundingSummary.totalCopay += amount;
            console.log(`      ✅ Added to Total Copay: $${amount}`);
          } else if (categoryCode === 'deductible' || total.category?.toLowerCase().includes('deductible')) {
            fundingSummary.totalDeductible += amount;
            console.log(`      ✅ Added to Total Deductible: $${amount}`);
          } else if (total.category?.toLowerCase().includes('patient') || 
                     total.category?.toLowerCase().includes('responsibility')) {
            fundingSummary.totalPatientResponsibility += amount;
            console.log(`      ✅ Added to Patient Responsibility: $${amount}`);
          }
        });
      } else {
        console.log(`    - No API totals found`);
      }
    });
  } else {
    console.log('⚠️  No EOBs found for this patient');
  }
  
  // Calculate remaining balance
  fundingSummary.remainingBalance = fundingSummary.totalPatientResponsibility - fundingSummary.totalCopay - fundingSummary.totalDeductible;
  
  console.log('💰 Final funding summary from raw API data:');
  console.log(`  - Total Billed: $${fundingSummary.totalBilled}`);
  console.log(`  - Total Covered: $${fundingSummary.totalCovered}`);
  console.log(`  - Patient Responsibility: $${fundingSummary.totalPatientResponsibility}`);
  console.log(`  - Copay: $${fundingSummary.totalCopay}`);
  console.log(`  - Deductible: $${fundingSummary.totalDeductible}`);
  console.log(`  - Remaining Balance: $${fundingSummary.remainingBalance}`);
  
  return fundingSummary;
}
