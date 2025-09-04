import axios from 'axios';
import { EOBDetails, EOBItemDetails, EOBTotalDetails, EOBPaymentDetails, EOBAdjudicationDetails } from '../types/fhir.js';
import { getCodeableConceptDisplay, getReferenceDisplay, getMoneyValue, formatServiceDates } from '../utils/fhirHelpers.js';

/**
 * Get Explanation of Benefits for a patient from Epic FHIR API
 */
export async function getExplanationOfBenefits(token: string, patientId: string): Promise<EOBDetails[]> {
  console.log('📋 Fetching ExplanationOfBenefits for patientId:', patientId);
  const headers = { Authorization: `Bearer ${token}` };
  
  try {
    const response = await axios.get(`${process.env.FHIR_BASE}/ExplanationOfBenefit?patient=${patientId}`, { headers });
    console.log('📋 EOB API Response status:', response.status);
    console.log('📋 EOB API Response data keys:', Object.keys(response.data));
    console.log('📋 EOB entries count:', response.data.entry?.length || 0);
    console.log('📋 EOB total from API:', response.data.total);
    
    if (response.data.entry && response.data.entry.length > 0) {
      console.log('📋 All EOB entry IDs:', response.data.entry.map((entry: any) => entry.resource?.id || 'No ID'));
      console.log('📋 Sample EOB entry structure:', JSON.stringify(response.data.entry[0], null, 2));
    }
    
    // Filter out invalid entries and ensure we only process valid EOB resources
    const validEntries = response.data.entry?.filter((entry: any) => 
      entry.resource && entry.resource.resourceType === 'ExplanationOfBenefit'
    ) || [];
    
    console.log('📋 Valid EOB entries count:', validEntries.length);
    
    // Remove duplicates based on resource ID
    const uniqueEntries = validEntries.filter((entry: any, index: number, self: any[]) => 
      index === self.findIndex((e: any) => e.resource.id === entry.resource.id)
    );
    
    console.log('📋 Unique EOB entries count:', uniqueEntries.length);
    
    return uniqueEntries.map((entry: any) => mapEOBResource(entry.resource));
  } catch (error) {
    console.error('❌ Error fetching ExplanationOfBenefits:', error);
    throw error;
  }
}

/**
 * Get specific EOB details by ID
 */
export async function getSpecificEOB(token: string, eobId: string): Promise<any> {
  console.log('📋 Fetching specific EOB:', eobId);
  const headers = { Authorization: `Bearer ${token}` };
  
  try {
    const response = await axios.get(`${process.env.FHIR_BASE}/ExplanationOfBenefit/${eobId}`, { headers });
    console.log('📋 Specific EOB fetched successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching specific EOB:', error);
    throw error;
  }
}

/**
 * Map FHIR EOB resource to our application format
 */
function mapEOBResource(resource: any): EOBDetails {
  console.log('📋 Mapping EOB resource:', resource.id);
  console.log('📋 Raw EOB totals:', resource.total);
  
  return {
    id: resource.id || resource.identifier?.[0]?.value || 'Unknown',
    status: resource.status,
    type: getCodeableConceptDisplay(resource.type),
    use: resource.use,
    patient: getReferenceDisplay(resource.patient),
    billablePeriod: {
      start: resource.billablePeriod?.start,
      end: resource.billablePeriod?.end
    },
    created: resource.created,
    insurer: getReferenceDisplay(resource.insurer),
    provider: getReferenceDisplay(resource.provider),
    facility: resource.facility ? getReferenceDisplay(resource.facility) : undefined,
    item: resource.item?.map(mapEOBItem) || [],
    total: resource.total?.map(mapEOBTotal) || [],
    payment: resource.payment ? mapEOBPayment(resource.payment) : undefined
  };
}

/**
 * Map FHIR EOB item to our application format
 */
function mapEOBItem(item: any): EOBItemDetails {
  return {
    sequence: item.sequence,
    productOrService: getCodeableConceptDisplay(item.productOrService),
    category: item.category ? getCodeableConceptDisplay(item.category) : undefined,
    servicedDate: item.servicedDate,
    servicedPeriodStart: item.servicedPeriod?.start || item.servicedDate,
    servicedPeriodEnd: item.servicedPeriod?.end || item.servicedDate,
    net: getMoneyValue(item.net),
    adjudication: item.adjudication?.map(mapEOBAdjudication) || []
  };
}

/**
 * Map FHIR EOB total to our application format
 */
function mapEOBTotal(total: any): EOBTotalDetails {
  console.log('📋 Mapping EOB total:', total);
  console.log('📋 Total category:', total.category);
  console.log('📋 Total amount structure:', total.amount);
  
  const amount = getMoneyValue(total.amount);
  const categoryText = getCodeableConceptDisplay(total.category);
  const categoryCode = total.category?.coding?.[0]?.code || '';
  const categorySystem = total.category?.coding?.[0]?.system || '';
  
  console.log('📋 Extracted amount:', amount);
  console.log('📋 Category text:', categoryText);
  console.log('📋 Category code:', categoryCode);
  console.log('📋 Category system:', categorySystem);
  
  return {
    category: categoryText,
    amount: amount,
    currency: total.amount?.currency || 'USD',
    // Add the original category object for better type identification
    categoryCode: categoryCode,
    categorySystem: categorySystem
  };
}

/**
 * Map FHIR EOB payment to our application format
 */
function mapEOBPayment(payment: any): EOBPaymentDetails {
  return {
    type: getCodeableConceptDisplay(payment.type),
    amount: getMoneyValue(payment.amount)
  };
}

/**
 * Map FHIR EOB adjudication to our application format
 */
function mapEOBAdjudication(adj: any): EOBAdjudicationDetails {
  return {
    category: getCodeableConceptDisplay(adj.category),
    reason: adj.reason ? getCodeableConceptDisplay(adj.reason) : undefined,
    amount: getMoneyValue(adj.amount)
  };
}

// Helper functions removed - now using direct API data mapping
