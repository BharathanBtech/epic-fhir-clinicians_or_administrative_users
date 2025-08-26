/**
 * Application Configuration
 * Centralized configuration management for environment variables and app settings
 */
import dotenv from 'dotenv';
dotenv.config();

export interface AppConfig {
  // Epic FHIR Configuration
  fhirBase: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  tokenUrl: string;
  authUrl: string;
  
  // Application Configuration
  port: number;
  sessionSecret: string;
  environment: string;
  
  // Feature Flags
  enableDebugLogging: boolean;
  enableDetailedErrorMessages: boolean;
  
  // Menu Feature Flags
  showPatient: boolean;
  showFundingSummary: boolean;
  showInsuranceCoverage: boolean;
  showExplanationOfBenefits: boolean;
  showOrganization: boolean;
  showPractitioner: boolean;
  showEncounter: boolean;
  showClaims: boolean;
  showInvoices: boolean;
  showAccounts: boolean;
  showPaymentReconciliation: boolean;
  showPaymentNotices: boolean;
  showChargeItems: boolean;
  showProcedures: boolean;
  showDiagnosticReports: boolean;
  showObservations: boolean;
}

/**
 * Load and validate application configuration from environment variables
 */
export function loadConfig(): AppConfig {

  
  const config: AppConfig = {
    // Epic FHIR Configuration
    fhirBase: process.env.FHIR_BASE || '',
    clientId: process.env.CLIENT_ID || '',
    clientSecret: process.env.CLIENT_SECRET || '',
    redirectUri: process.env.REDIRECT_URI || '',
    tokenUrl: process.env.TOKEN_URL || '',
    authUrl: process.env.AUTH_URL || '',
    
    // Application Configuration
    port: parseInt(process.env.PORT || '4000', 10),
    sessionSecret: process.env.SESSION_SECRET || 'your_secret_key',
    environment: process.env.NODE_ENV || 'development',
    
    // Feature Flags
    enableDebugLogging: process.env.NODE_ENV === 'development',
    enableDetailedErrorMessages: process.env.NODE_ENV === 'development',
    
    // Menu Feature Flags
    showPatient: process.env.SHOW_PATIENT === 'true',
    showFundingSummary: process.env.SHOW_FUNDING_SUMMARY === 'true',
    showInsuranceCoverage: process.env.SHOW_INSURANCE_COVERAGE === 'true',
    showExplanationOfBenefits: process.env.SHOW_EXPLANATION_OF_BENEFITS === 'true',
    showOrganization: process.env.SHOW_ORGANIZATION === 'true',
    showPractitioner: process.env.SHOW_PRACTITIONER === 'true',
    showEncounter: process.env.SHOW_ENCOUNTER === 'true',
    showClaims: process.env.SHOW_CLAIMS === 'true',
    showInvoices: process.env.SHOW_INVOICES === 'true',
    showAccounts: process.env.SHOW_ACCOUNTS === 'true',
    showPaymentReconciliation: process.env.SHOW_PAYMENT_RECONCILIATION === 'true',
    showPaymentNotices: process.env.SHOW_PAYMENT_NOTICES === 'true',
    showChargeItems: process.env.SHOW_CHARGE_ITEMS === 'true',
    showProcedures: process.env.SHOW_PROCEDURES === 'true',
    showDiagnosticReports: process.env.SHOW_DIAGNOSTIC_REPORTS === 'true',
    showObservations: process.env.SHOW_OBSERVATIONS === 'true'
  };
  
  // Only validate required configuration in production
  if (config.environment === 'production') {
    validateConfig(config);
  } else {
    // In development, just warn about missing variables
    const missingFields = getMissingFields(config);
    if (missingFields.length > 0) {
      console.warn(`⚠️  Missing environment variables (development mode): ${missingFields.join(', ')}`);
      console.warn('   The application will work but Epic FHIR features will not function.');
    }
  }
  
  return config;
}

/**
 * Get missing required configuration fields
 */
function getMissingFields(config: AppConfig): string[] {
  const requiredFields = [
    'fhirBase',
    'clientId', 
    'clientSecret',
    'redirectUri',
    'tokenUrl',
    'authUrl'
  ];
  
  return requiredFields.filter(field => !config[field as keyof AppConfig]);
}

/**
 * Validate that all required configuration values are present
 */
function validateConfig(config: AppConfig): void {
  const missingFields = getMissingFields(config);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required environment variables: ${missingFields.join(', ')}`);
  }
}

/**
 * Get configuration singleton
 */
let configInstance: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (!configInstance) {
    configInstance = loadConfig();
  }
  return configInstance;
}
