import { AuthProvider, AuthConfig } from '../app/core/models/auth-config.model';

// Default configuration values - can be overridden by environment variables
const DEFAULT_CONFIG = {
  KEYCLOAK_URL: 'http://localhost:9180',
  KEYCLOAK_REALM: 'quarkus-realm',
  KEYCLOAK_CLIENT_ID: 'quarkus-bamoe-frontend',
  API_ENQUIRY_SERVICE: 'http://localhost:8081/api',
  API_PROCESS_SERVICE: 'http://localhost:8080'
};

// Helper function to get environment variable with fallback
function getEnvValue(key: string, defaultValue: string): string {
  // In a real application, you would use a library like dotenv
  // For now, we'll use the default values
  return defaultValue;
}

export const environment = {
  production: false,
  
  // OAuth/OIDC Configuration
  auth: {
    provider: AuthProvider.KEYCLOAK,
    clientId: getEnvValue('KEYCLOAK_CLIENT_ID', DEFAULT_CONFIG.KEYCLOAK_CLIENT_ID),
    issuer: `${getEnvValue('KEYCLOAK_URL', DEFAULT_CONFIG.KEYCLOAK_URL)}/realms/${getEnvValue('KEYCLOAK_REALM', DEFAULT_CONFIG.KEYCLOAK_REALM)}`,
    realm: getEnvValue('KEYCLOAK_REALM', DEFAULT_CONFIG.KEYCLOAK_REALM),
    scope: 'openid profile email',
    showDebugInformation: true,
    useSilentRefresh: true,
    requireHttps: false
  } as AuthConfig,
  
  api: {
    enquiryService: getEnvValue('API_ENQUIRY_SERVICE', DEFAULT_CONFIG.API_ENQUIRY_SERVICE),
    processService: getEnvValue('API_PROCESS_SERVICE', DEFAULT_CONFIG.API_PROCESS_SERVICE)
  }
};