import axios from 'axios';
import { getConfig } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { PractitionerDetails } from '../types/fhir.js';

const config = getConfig();

export async function getPractitioner(practitionerId: string, accessToken: string): Promise<PractitionerDetails> {
  try {
    logger.info('Fetching practitioner details', { practitionerId });
    
    const response = await axios.get(`${config.fhirBase}/Practitioner/${practitionerId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/fhir+json'
      }
    });

    logger.info('Practitioner data received', { 
      practitionerId, 
      status: response.status,
      dataKeys: Object.keys(response.data || {})
    });

    const practitioner = response.data;
    
    return {
      id: practitioner.id,
      identifier: practitioner.identifier,
      active: practitioner.active,
      name: practitioner.name?.[0],
      telecom: practitioner.telecom,
      address: practitioner.address,
      gender: practitioner.gender,
      birthDate: practitioner.birthDate,
      photo: practitioner.photo,
      qualification: practitioner.qualification,
      communication: practitioner.communication
    };
  } catch (error: any) {
    logger.error('Failed to fetch practitioner', { 
      practitionerId, 
      error: error.message,
      status: error.response?.status 
    });
    throw new Error(`Failed to fetch practitioner: ${error.message}`);
  }
}

export async function searchPractitioners(searchParams: {
  name?: string;
  identifier?: string;
  specialty?: string;
}, accessToken: string): Promise<PractitionerDetails[]> {
  try {
    logger.info('Searching practitioners', { searchParams });
    
    const params = new URLSearchParams();
    if (searchParams.name) params.append('name', searchParams.name);
    if (searchParams.identifier) params.append('identifier', searchParams.identifier);
    if (searchParams.specialty) params.append('specialty', searchParams.specialty);
    
    const response = await axios.get(`${config.fhirBase}/Practitioner?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/fhir+json'
      }
    });

    logger.info('Practitioner search results', { 
      total: response.data?.total,
      count: response.data?.entry?.length || 0
    });

    if (!response.data.entry) {
      return [];
    }

    return response.data.entry.map((entry: any) => {
      const practitioner = entry.resource;
      return {
        id: practitioner.id,
        identifier: practitioner.identifier,
        active: practitioner.active,
        name: practitioner.name?.[0],
        telecom: practitioner.telecom,
        address: practitioner.address,
        gender: practitioner.gender,
        birthDate: practitioner.birthDate,
        photo: practitioner.photo,
        qualification: practitioner.qualification,
        communication: practitioner.communication
      };
    });
  } catch (error: any) {
    logger.error('Failed to search practitioners', { 
      searchParams, 
      error: error.message,
      status: error.response?.status 
    });
    throw new Error(`Failed to search practitioners: ${error.message}`);
  }
}

export async function getPractitionerByPatient(patientId: string, accessToken: string): Promise<PractitionerDetails[]> {
  try {
    logger.info('Fetching practitioners for patient', { patientId });
    
    // First, get patient details to extract practitioner IDs
    const patientResponse = await axios.get(`${config.fhirBase}/Patient/${patientId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/fhir+json'
      }
    });

    const patient = patientResponse.data;
    const practitionerIds: string[] = [];

    // Extract practitioner IDs from generalPractitioner references
    if (patient.generalPractitioner && patient.generalPractitioner.length > 0) {
      patient.generalPractitioner.forEach((gp: any) => {
        const reference = gp.reference;
        if (reference && reference.startsWith('Practitioner/')) {
          const practitionerId = reference.replace('Practitioner/', '');
          practitionerIds.push(practitionerId);
        }
      });
    }

    logger.info('Found practitioner IDs from patient data', { 
      patientId, 
      practitionerIds 
    });

    if (practitionerIds.length === 0) {
      logger.info('No practitioner IDs found for patient', { patientId });
      return [];
    }

    // Fetch each practitioner by ID
    const practitioners: PractitionerDetails[] = [];
    
    for (const practitionerId of practitionerIds) {
      try {
        const practitionerResponse = await axios.get(`${config.fhirBase}/Practitioner/${practitionerId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/fhir+json'
          }
        });

        const practitioner = practitionerResponse.data;
        practitioners.push({
          id: practitioner.id,
          identifier: practitioner.identifier,
          active: practitioner.active,
          name: practitioner.name?.[0],
          telecom: practitioner.telecom,
          address: practitioner.address,
          gender: practitioner.gender,
          birthDate: practitioner.birthDate,
          photo: practitioner.photo,
          qualification: practitioner.qualification,
          communication: practitioner.communication
        });

        logger.info('Successfully fetched practitioner', { practitionerId });
      } catch (practitionerError: any) {
        logger.error('Failed to fetch individual practitioner', { 
          practitionerId, 
          error: practitionerError.message 
        });
        // Continue with other practitioners even if one fails
      }
    }

    logger.info('Completed fetching practitioners for patient', { 
      patientId, 
      totalRequested: practitionerIds.length,
      totalFetched: practitioners.length
    });

    return practitioners;
  } catch (error: any) {
    logger.error('Failed to fetch patient practitioners', { 
      patientId, 
      error: error.message,
      status: error.response?.status 
    });
    throw new Error(`Failed to fetch patient practitioners: ${error.message}`);
  }
}
