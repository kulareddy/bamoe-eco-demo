export enum AuthProvider {
  KEYCLOAK = 'keycloak',
  ENTRA_ID = 'entra-id',
  AUTH0 = 'auth0',
  GENERIC_OIDC = 'generic-oidc'
}

export interface BaseAuthConfig {
  provider: AuthProvider;
  clientId: string;
  scope: string;
  showDebugInformation?: boolean;
  silentRefreshRedirectUri?: string;
  useSilentRefresh?: boolean;
  requireHttps?: boolean;
}

export interface KeycloakAuthConfig extends BaseAuthConfig {
  provider: AuthProvider.KEYCLOAK;
  issuer: string; // e.g., 'http://localhost:9180/realms/quarkus-realm'
  realm: string;
  redirectUri?: string;
}

export interface EntraIdAuthConfig extends BaseAuthConfig {
  provider: AuthProvider.ENTRA_ID;
  issuer: string; // e.g., 'https://login.microsoftonline.com/{tenant-id}/v2.0'
  tenantId: string;
  redirectUri?: string;
}

export interface Auth0AuthConfig extends BaseAuthConfig {
  provider: AuthProvider.AUTH0;
  issuer: string; // e.g., 'https://your-domain.auth0.com'
  domain: string;
  redirectUri?: string;
}

export interface GenericOidcAuthConfig extends BaseAuthConfig {
  provider: AuthProvider.GENERIC_OIDC;
  issuer: string;
  tokenEndpoint?: string;
  userinfoEndpoint?: string;
  jwksUri?: string;
  redirectUri?: string;
}

export type AuthConfig = 
  | KeycloakAuthConfig 
  | EntraIdAuthConfig 
  | Auth0AuthConfig 
  | GenericOidcAuthConfig;

export interface UserInfo {
  sub: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  email_verified?: boolean;
  roles?: string[];
  groups?: string[];
  preferred_username?: string;
  // Allow for additional custom claims
  [key: string]: any;
}