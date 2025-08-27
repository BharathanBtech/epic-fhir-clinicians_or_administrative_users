// Re-export functions from modular services for backward compatibility
export { getPatientDetails, searchPatient } from './patientService.js';
export { getPatientCoverage } from './coverageService.js';
export { getExplanationOfBenefits, getSpecificEOB } from './eobService.js';
export { getPatientFundingSummary } from './fundingService.js';
export { exchangeCodeForToken, validateTokenResponse } from './authService.js';
export { getPractitioner, searchPractitioners, getPractitionerByPatient } from './practitionerService.js';
export { getOrganization, searchOrganizations, getOrganizationByPatient } from './organizationService.js';

// Legacy functions that might still be used by other parts of the application
// These can be removed once all routes are updated to use the new modular services

/**
 * @deprecated Use getPatientSummary from patientService instead
 */
export async function getPatientSummary(token: string, patientId: string) {
  console.warn('⚠️  getPatientSummary is deprecated. Use getPatientDetails from patientService instead.');
  const { getPatientDetails } = await import('./patientService.js');
  return getPatientDetails(token, patientId);
}

