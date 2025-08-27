import axios from 'axios';
import { getConfig } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { OrganizationDetails } from '../types/fhir.js';

const config = getConfig();

export async function getOrganization(organizationId: string, accessToken: string): Promise<OrganizationDetails> {
  try {
    logger.info('Fetching organization details', { organizationId });
    
    const response = await axios.get(`${config.fhirBase}/Organization/${organizationId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/fhir+json'
      }
    });

    logger.info('Organization data received', { 
      organizationId, 
      status: response.status,
      dataKeys: Object.keys(response.data || {})
    });

    const organization = response.data;
    
    return {
      id: organization.id,
      identifier: organization.identifier,
      active: organization.active,
      name: organization.name,
      alias: organization.alias,
      telecom: organization.telecom,
      address: organization.address,
      type: organization.type,
      partOf: organization.partOf,
      contact: organization.contact,
      endpoint: organization.endpoint
    };
  } catch (error: any) {
    logger.error('Failed to fetch organization', { 
      organizationId, 
      error: error.message,
      status: error.response?.status 
    });
    throw new Error(`Failed to fetch organization: ${error.message}`);
  }
}

export async function searchOrganizations(searchParams: {
  name?: string;
  identifier?: string;
  type?: string;
}, accessToken: string): Promise<OrganizationDetails[]> {
  try {
    logger.info('Searching organizations', { searchParams });
    
    const params = new URLSearchParams();
    if (searchParams.name) params.append('name', searchParams.name);
    if (searchParams.identifier) params.append('identifier', searchParams.identifier);
    if (searchParams.type) params.append('type', searchParams.type);
    
    const response = await axios.get(`${config.fhirBase}/Organization?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/fhir+json'
      }
    });

    logger.info('Organization search results', { 
      total: response.data?.total,
      count: response.data?.entry?.length || 0
    });

    if (!response.data.entry) {
      return [];
    }

    return response.data.entry.map((entry: any) => {
      const organization = entry.resource;
      return {
        id: organization.id,
        identifier: organization.identifier,
        active: organization.active,
        name: organization.name,
        alias: organization.alias,
        telecom: organization.telecom,
        address: organization.address,
        type: organization.type,
        partOf: organization.partOf,
        contact: organization.contact,
        endpoint: organization.endpoint
      };
    });
  } catch (error: any) {
    logger.error('Failed to search organizations', { 
      searchParams, 
      error: error.message,
      status: error.response?.status 
    });
    throw new Error(`Failed to search organizations: ${error.message}`);
  }
}

export async function getOrganizationByPatient(patientId: string, accessToken: string): Promise<OrganizationDetails[]> {
  try {
    logger.info('Fetching organizations for patient', { patientId });
    
    // First, get patient details to extract organization IDs
    const patientResponse = await axios.get(`${config.fhirBase}/Patient/${patientId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/fhir+json'
      }
    });

    const patient = patientResponse.data;
    const organizationIds: string[] = [];

    // Extract organization IDs from managingOrganization reference
    if (patient.managingOrganization) {
      const reference = patient.managingOrganization.reference;
      if (reference && reference.startsWith('Organization/')) {
        const organizationId = reference.replace('Organization/', '');
        organizationIds.push(organizationId);
      }
    }

    // Also check for organization references in generalPractitioner (if they have organization affiliations)
    if (patient.generalPractitioner && patient.generalPractitioner.length > 0) {
      // This would require additional API calls to get practitioner details and their organization affiliations
      // For now, we'll focus on the managingOrganization
    }

    logger.info('Found organization IDs from patient data', { 
      patientId, 
      organizationIds 
    });

    if (organizationIds.length === 0) {
      logger.info('No organization IDs found for patient', { patientId });
      return [];
    }

    // Fetch each organization by ID
    const organizations: OrganizationDetails[] = [];
    
    for (const organizationId of organizationIds) {
      try {
        const organizationResponse = await axios.get(`${config.fhirBase}/Organization/${organizationId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/fhir+json'
          }
        });

        const organization = organizationResponse.data;
        organizations.push({
          id: organization.id,
          identifier: organization.identifier,
          active: organization.active,
          name: organization.name,
          alias: organization.alias,
          telecom: organization.telecom,
          address: organization.address,
          type: organization.type,
          partOf: organization.partOf,
          contact: organization.contact,
          endpoint: organization.endpoint
        });

        logger.info('Successfully fetched organization', { organizationId });
      } catch (organizationError: any) {
        logger.error('Failed to fetch individual organization', { 
          organizationId, 
          error: organizationError.message 
        });
        // Continue with other organizations even if one fails
      }
    }

    logger.info('Completed fetching organizations for patient', { 
      patientId, 
      totalRequested: organizationIds.length,
      totalFetched: organizations.length
    });

    return organizations;
  } catch (error: any) {
    logger.error('Failed to fetch patient organizations', { 
      patientId, 
      error: error.message,
      status: error.response?.status 
    });
    throw new Error(`Failed to fetch patient organizations: ${error.message}`);
  }
}
