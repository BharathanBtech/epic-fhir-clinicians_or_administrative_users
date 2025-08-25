import axios from 'axios';
import { PatientDetails } from '../types/fhir.js';

/**
 * Get detailed patient information from Epic FHIR API
 */
export async function getPatientDetails(token: string, patientId: string): Promise<PatientDetails> {
  console.log('👤 Fetching patient details for patientId:', patientId);
  const headers = { Authorization: `Bearer ${token}` };
  
  try {
    const response = await axios.get(`${process.env.FHIR_BASE}/Patient/${patientId}`, { headers });
    console.log('👤 Patient API Response status:', response.status);
    
    const patient = response.data;
    
    return {
      id: patient.id,
      mrn: patient.identifier?.find((id: any) => id.system?.includes('MRN'))?.value,
      name: patient.name?.[0]?.text || `${patient.name?.[0]?.given?.join(' ')} ${patient.name?.[0]?.family}`,
      given: patient.name?.[0]?.given?.join(' '),
      family: patient.name?.[0]?.family,
      gender: patient.gender,
      birthDate: patient.birthDate,
      address: patient.address?.[0],
      phone: patient.telecom?.find((t: any) => t.system === 'phone')?.value,
      email: patient.telecom?.find((t: any) => t.system === 'email')?.value
    };
  } catch (error) {
    console.error('❌ Error fetching patient details:', error);
    throw error;
  }
}

/**
 * Search for patients by name
 */
export async function searchPatient(token: string, given: string, family: string) {
  console.log('🔍 Searching for patient:', given, family);
  const headers = { Authorization: `Bearer ${token}` };
  
  try {
    const response = await axios.get(
      `${process.env.FHIR_BASE}/Patient?given=${given}&family=${family}`,
      { headers }
    );
    
    console.log('🔍 Patient search successful');
    return response.data;
  } catch (error) {
    console.error('❌ Error searching patient:', error);
    throw error;
  }
}
