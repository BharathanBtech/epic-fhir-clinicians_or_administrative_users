import axios from 'axios';
import { CoverageDetails } from '../types/fhir.js';
import { getCodeableConceptDisplay, getReferenceDisplay } from '../utils/fhirHelpers.js';

/**
 * Get patient insurance coverage information from Epic FHIR API
 */
export async function getPatientCoverage(token: string, patientId: string): Promise<CoverageDetails[]> {
  console.log('🏥 Fetching patient coverage for patientId:', patientId);
  const headers = { Authorization: `Bearer ${token}` };
  
  try {
    const response = await axios.get(`${process.env.FHIR_BASE}/Coverage?patient=${patientId}`, { headers });
    console.log('🏥 Coverage API Response status:', response.status);
    console.log('🏥 Coverage entries count:', response.data.entry?.length || 0);
    
    return response.data.entry?.map((entry: any) => ({
      id: entry.resource.id,
      status: entry.resource.status,
      type: getCodeableConceptDisplay(entry.resource.type),
      subscriber: getReferenceDisplay(entry.resource.subscriber),
      beneficiary: getReferenceDisplay(entry.resource.beneficiary),
      relationship: getCodeableConceptDisplay(entry.resource.relationship),
      period: {
        start: entry.resource.period?.start,
        end: entry.resource.period?.end
      },
      payor: entry.resource.payor?.map((p: any) => getReferenceDisplay(p)),
      class: entry.resource.class?.map((c: any) => ({
        type: getCodeableConceptDisplay(c.type),
        value: c.value,
        name: c.name
      }))
    })) || [];
  } catch (error) {
    console.error('❌ Error fetching patient coverage:', error);
    throw error;
  }
}
