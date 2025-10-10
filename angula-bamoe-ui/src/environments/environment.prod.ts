import { AuthProvider, AuthConfig } from '../app/core/models/auth-config.model';

// Production configuration values - should be set via environment variables
const PROD_CONFIG = {
  KEYCLOAK_URL: 'https://your-production-keycloak.com',
  KEYCLOAK_REALM: 'quarkus-realm',
  KEYCLOAK_CLIENT_ID: 'quarkus-bamoe-frontend',
  API_ENQUIRY_SERVICE: 'https://your-production-api.com/api',
  API_PROCESS_SERVICE: 'https://your-production-process-service.com'
};

// Helper function to get environment variable with fallback
function getEnvValue(key: string, defaultValue: string): string {
  // In production, these should be set via environment variables
  return defaultValue;
}

export const environment = {
  production: true,
  
  // OAuth/OIDC Configuration
  auth: {
    provider: AuthProvider.KEYCLOAK,
    clientId: getEnvValue('KEYCLOAK_CLIENT_ID', PROD_CONFIG.KEYCLOAK_CLIENT_ID),
    issuer: `${getEnvValue('KEYCLOAK_URL', PROD_CONFIG.KEYCLOAK_URL)}/realms/${getEnvValue('KEYCLOAK_REALM', PROD_CONFIG.KEYCLOAK_REALM)}`,
    realm: getEnvValue('KEYCLOAK_REALM', PROD_CONFIG.KEYCLOAK_REALM),
    scope: 'openid profile email',
    showDebugInformation: false,
    useSilentRefresh: true,
    requireHttps: true
  } as AuthConfig,
  
  api: {
    enquiryService: getEnvValue('API_ENQUIRY_SERVICE', PROD_CONFIG.API_ENQUIRY_SERVICE),
    processService: getEnvValue('API_PROCESS_SERVICE', PROD_CONFIG.API_PROCESS_SERVICE)
  }
};