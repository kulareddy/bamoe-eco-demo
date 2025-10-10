# OAuth/OIDC Provider Configuration

This Angular application supports multiple OAuth/OIDC providers through a vendor-agnostic authentication system. You can easily switch between providers by modifying the environment configuration.

## Supported Providers

- **Keycloak** (Default)
- **Microsoft Entra ID / Azure AD**
- **Auth0**
- **Generic OIDC** (Any OpenID Connect compliant provider)

## Configuration

### 1. Keycloak (Default)

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  authProvider: 'keycloak' as AuthProvider,
  authConfig: {
    issuer: 'http://localhost:8080/realms/your-realm',
    clientId: 'your-client-id',
    redirectUri: window.location.origin,
    scope: 'openid profile email',
    responseType: 'code',
    requireHttps: false, // Set to true in production
    showDebugInformation: true, // Remove in production
    keycloakConfig: {
      realm: 'your-realm',
      adminRoles: ['admin'],
      realmRoles: ['user', 'manager']
    }
  }
};
```

**Keycloak Client Configuration:**
- Access Type: `public` or `confidential`
- Valid Redirect URIs: `http://localhost:4200/*` (adjust for your domain)
- Web Origins: `http://localhost:4200` (adjust for your domain)
- Enable "Standard Flow" and "Direct Access Grants"

### 2. Microsoft Entra ID / Azure AD

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  authProvider: 'entra' as AuthProvider,
  authConfig: {
    issuer: 'https://login.microsoftonline.com/{tenant-id}/v2.0',
    clientId: 'your-client-id',
    redirectUri: window.location.origin,
    scope: 'openid profile email',
    responseType: 'code',
    requireHttps: true,
    showDebugInformation: true,
    entraConfig: {
      tenantId: 'your-tenant-id',
      authority: 'https://login.microsoftonline.com/{tenant-id}',
      adminRoles: ['Admin'],
      appRoles: ['User', 'Manager'] // Define in Azure AD App Registration
    }
  }
};
```

**Azure AD App Registration:**
1. Go to Azure Portal → Azure Active Directory → App registrations
2. Create new registration or use existing
3. Set Redirect URI: `http://localhost:4200` (SPA type)
4. Enable ID tokens and Access tokens
5. Configure API permissions: `openid`, `profile`, `email`
6. Define App roles in Manifest if needed

### 3. Auth0

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  authProvider: 'auth0' as AuthProvider,
  authConfig: {
    issuer: 'https://your-domain.auth0.com',
    clientId: 'your-client-id',
    redirectUri: window.location.origin,
    scope: 'openid profile email',
    responseType: 'code',
    requireHttps: true,
    showDebugInformation: true,
    auth0Config: {
      domain: 'your-domain.auth0.com',
      audience: 'your-api-identifier', // Optional
      adminRoles: ['admin'],
      userRoles: ['user', 'manager']
    }
  }
};
```

**Auth0 Application Configuration:**
1. Go to Auth0 Dashboard → Applications
2. Create Single Page Application
3. Set Allowed Callback URLs: `http://localhost:4200`
4. Set Allowed Logout URLs: `http://localhost:4200`
5. Set Allowed Web Origins: `http://localhost:4200`
6. Configure roles in Auth0 Rules or Actions

### 4. Generic OIDC Provider

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  authProvider: 'generic' as AuthProvider,
  authConfig: {
    issuer: 'https://your-oidc-provider.com',
    clientId: 'your-client-id',
    redirectUri: window.location.origin,
    scope: 'openid profile email',
    responseType: 'code',
    requireHttps: true,
    showDebugInformation: true,
    genericConfig: {
      tokenEndpoint: 'https://your-oidc-provider.com/token',
      userinfoEndpoint: 'https://your-oidc-provider.com/userinfo',
      logoutUrl: 'https://your-oidc-provider.com/logout',
      adminRoles: ['admin'],
      userRoles: ['user']
    }
  }
};
```

## Role Mapping

The application uses role-based access control (RBAC). Configure roles in your provider:

### Default Role Structure:
- **admin**: Full system access including admin panel
- **manager**: Enquiry management and team oversight
- **user**: Basic enquiry creation and task management
- **analyst**: Advanced enquiry analysis
- **tech-support**: Technical support functions
- **business-support**: Business support functions

### Provider-Specific Role Configuration:

#### Keycloak
- Define roles in Realm Roles or Client Roles
- Assign roles to users through Keycloak Admin Console
- Roles are included in the JWT token automatically

#### Microsoft Entra ID
- Define App Roles in the App Registration manifest
- Assign roles to users/groups through Enterprise Applications
- Roles come in the `roles` claim

#### Auth0
- Define roles using Auth0 Authorization Extension or Rules
- Use Actions to add roles to tokens
- Custom claim: `https://your-app.com/roles`

## Environment-Specific Configuration

### Development (environment.ts)
- Set `requireHttps: false` for local development
- Enable `showDebugInformation: true` for debugging
- Use localhost URLs

### Production (environment.prod.ts)
- Set `requireHttps: true`
- Disable debug information
- Use production URLs and secure configurations
- Consider using environment variables for sensitive data

## Backend Integration

Ensure your backend APIs (Quarkus BAMOE and Spring Boot) are configured to validate tokens from your chosen provider:

### Quarkus Configuration
```properties
# application.properties
quarkus.oidc.auth-server-url=${OIDC_ISSUER}
quarkus.oidc.client-id=${OIDC_CLIENT_ID}
quarkus.oidc.credentials.secret=${OIDC_CLIENT_SECRET}
```

### Spring Boot Configuration
```yaml
# application.yml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: ${OIDC_ISSUER}
```

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Ensure your OAuth provider allows your application domain
2. **Invalid Redirect URI**: Check redirect URI configuration in provider
3. **Token Validation Errors**: Verify issuer URL and client configuration
4. **Role Missing**: Check role mapping and token claims
5. **HTTPS Required**: Some providers require HTTPS even in development

### Debug Mode:
Enable debug information in development:
```typescript
authConfig: {
  showDebugInformation: true, // Shows OAuth flow details in console
  // ... other config
}
```

## Migration Between Providers

To switch providers:

1. Update `authProvider` in environment configuration
2. Update `authConfig` with provider-specific settings
3. Restart the application
4. Clear browser storage/cookies if needed

The authentication service will automatically adapt to the new provider without code changes.