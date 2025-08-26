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
      maritalStatus: patient.maritalStatus?.text || patient.maritalStatus?.coding?.[0]?.display,
      address: patient.address?.[0] ? {
        line: patient.address[0].line,
        city: patient.address[0].city,
        state: patient.address[0].state,
        postalCode: patient.address[0].postalCode,
        country: patient.address[0].country
      } : undefined,
      phone: patient.telecom?.find((t: any) => t.system === 'phone')?.value,
      email: patient.telecom?.find((t: any) => t.system === 'email')?.value,
      language: patient.communication?.[0]?.language?.coding?.[0]?.display || patient.communication?.[0]?.language?.text,
      ethnicity: patient.extension?.find((ext: any) => ext.url?.includes('ethnicity'))?.valueCodeableConcept?.coding?.[0]?.display,
      race: patient.extension?.find((ext: any) => ext.url?.includes('race'))?.valueCodeableConcept?.coding?.[0]?.display,
      deceased: patient.deceasedBoolean || false,
      deceasedDate: patient.deceasedDateTime,
      multipleBirth: patient.multipleBirthBoolean || false,
      multipleBirthCount: patient.multipleBirthInteger,
      photo: patient.photo?.[0]?.url,
      contact: patient.contact?.map((contact: any) => ({
        relationship: contact.relationship?.[0]?.coding?.[0]?.display || contact.relationship?.[0]?.text,
        name: contact.name?.text || `${contact.name?.given?.join(' ')} ${contact.name?.family}`,
        phone: contact.telecom?.find((t: any) => t.system === 'phone')?.value,
        email: contact.telecom?.find((t: any) => t.system === 'email')?.value
      }))
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
