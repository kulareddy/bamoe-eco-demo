# OIDC Configuration Guide

This Spring Boot application supports both Keycloak and Azure Entra ID as OIDC providers. The configuration uses environment variables following the Quarkus pattern to make it provider-agnostic.

## Environment Variables

Set these environment variables based on your OIDC provider:

### For Keycloak
```bash
export OIDC_AUTH_SERVER_URL="http://localhost:9180/realms/artifact-realm"
export OIDC_CLIENT_ID="spring-boot-api"
export OIDC_CLIENT_SECRET="spring-boot-api-secret"
export OAUTH_SCOPE="openid profile email"
export SPRING_SECURITY_OAUTH2_IDP_TYPE="keycloak"  # Optional, defaults to keycloak
```

### For Azure Entra ID
```bash
export OIDC_AUTH_SERVER_URL="https://login.microsoftonline.com/{tenant-id}/v2.0"
export OIDC_CLIENT_ID="{client-id}"
export OIDC_CLIENT_SECRET="{client-secret}"
export OAUTH_SCOPE="openid profile email"
export SPRING_SECURITY_OAUTH2_IDP_TYPE="azure"
```

## Key Differences

| Provider | Auth Server URL Pattern | JWK Set URI Pattern |
|----------|-------------------|-------------------|
| **Keycloak** | `{base-url}/realms/{realm}` | `{auth-server-url}/protocol/openid-connect/certs` |
| **Azure Entra ID** | `https://login.microsoftonline.com/{tenant-id}/v2.0` | `{auth-server-url}/discovery/v2.0/keys` |

## Spring Boot OIDC Configuration

This Spring Boot application uses JWT validation for OAuth2 resource server authentication.

## Resource Server Client Secret Usage

**Important**: Resource servers typically **don't need client secrets** for JWT validation because:

- ✅ **JWT Validation**: Uses public keys from JWK Set URI (no secret needed)
- ✅ **Stateless**: No server-side session or token storage
- ✅ **Self-contained**: JWT contains all necessary claims

### When Resource Servers DO Need Client Secrets:

1. **Outbound API Calls**: When your service needs to call other APIs
2. **Token Introspection**: Alternative to JWT validation (less common)
3. **Token Refresh**: If you need to refresh tokens
4. **Custom Validation**: Special token validation logic
5. **Client Credentials Flow**: When accepting tokens from client applications

## Client Credentials Flow Support

This application now supports **both user tokens and client credentials tokens**:

### User Tokens (Authorization Code Flow)
- **Keycloak**: Roles extracted from `realm_access.roles`
- **Azure**: Roles extracted from `roles` claim
- Contains user identity and assigned roles

### Client Credentials Tokens (Client Credentials Flow)
- **Keycloak**: 
  - Client roles from `resource_access.{client-id}.roles`
  - Scopes from `scope` claim
- **Azure**: 
  - Scopes from `scp` or `scope` claims
  - App roles from `app_roles` claim
- Contains client identity and granted scopes/roles

### Token Claim Mapping

| Token Type | Keycloak Claims | Azure Claims | Mapped Authorities |
|------------|----------------|--------------|-------------------|
| **User Token** | `realm_access.roles` | `roles` | Direct role mapping |
| **Client Token** | `resource_access.{client}.roles` | `scp`, `app_roles` | Scope → role mapping |
| **Fallback** | `scope` | `scope` | `read`→`readonly`, `write`→`user` |

### Configuration Options:

```properties
# JWT Validation (default - no client secret needed)
spring.security.oauth2.resourceserver.jwt.issuer-uri=${OIDC_AUTH_SERVER_URL}
spring.security.oauth2.resourceserver.jwt.jwk-set-uri=${OIDC_AUTH_SERVER_URL}/protocol/openid-connect/certs

# Outbound calls (if needed)
spring.security.oauth2.client.registration.oidc.client-secret=${OIDC_CLIENT_SECRET}

# Token introspection (alternative to JWT)
spring.security.oauth2.resourceserver.opaque-token.client-secret=${OIDC_CLIENT_SECRET}
```

## Configuration Benefits

- **Single Base URL**: Uses `OIDC_AUTH_SERVER_URL` as the base for all endpoints
- **Automatic JWK Discovery**: JWK Set URI is automatically constructed from the auth server URL
- **Consistent Naming**: Follows OIDC standard naming conventions
- **Environment-based**: Easy to switch between providers using environment variables
- **Quarkus Compatible**: Same environment variable names as Quarkus applications

## Role Mapping

The application automatically maps roles based on the provider:

- **Keycloak**: Extracts roles from `realm_access.roles` claim
- **Azure Entra ID**: Extracts roles from `roles` claim

Supported roles: `artifact-admin`, `artifact-user`, `artifact-readonly`

## Testing

1. **Development (Keycloak)**: Default configuration points to `http://localhost:9180/realms/artifact-realm`
2. **Production (Azure)**: Set environment variables for your Azure tenant

## Security Profiles

- **Development**: Uses global security configuration with `@PreAuthorize("authenticated")`
- **Production**: Security enabled, requires valid JWT tokens

## .env File Support

This application supports `.env` files for local development! The `dotenv-java` library automatically loads environment variables from a `.env` file in your project root.

### How It Works

1. **Development**: Create a `.env` file with your local settings
2. **Production**: Use system environment variables (`.env` is ignored)
3. **Priority**: System environment variables override `.env` values

### .env File Example

Create a `.env` file in your project root:

```bash
# Keycloak Development
OIDC_AUTH_SERVER_URL=http://localhost:9180/realms/artifact-realm
OIDC_CLIENT_ID=spring-boot-api
OIDC_CLIENT_SECRET=spring-boot-api-secret
OAUTH_SCOPE=openid profile email
SPRING_SECURITY_OAUTH2_IDP_TYPE=keycloak

# Database (if needed)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=springbootapi
DB_USER=springbootapi
DB_PASSWORD=Ch@ngeme
```

### Alternative: System Environment Variables

You can also set environment variables directly:

```bash
export OIDC_AUTH_SERVER_URL="http://localhost:9180/realms/artifact-realm"
export OIDC_CLIENT_ID="spring-boot-api"
export OIDC_CLIENT_SECRET="spring-boot-api-secret"
export OAUTH_SCOPE="openid profile email"
```

## Troubleshooting Client Credentials

### Common Issues

1. **Client Credentials Not Working**
   - ✅ Verify client has correct scopes/roles assigned in IdP
   - ✅ Check token claims using JWT debugger (jwt.io)
   - ✅ Ensure client credentials are correctly configured
   - ✅ Verify token endpoint URL is correct

2. **Token Validation Failures**
   - ✅ Check JWK Set URI is accessible
   - ✅ Verify issuer URI matches token `iss` claim
   - ✅ Ensure client ID matches token `aud` or `azp` claim

3. **Authorization Failures**
   - ✅ Check if roles/scopes are being extracted correctly
   - ✅ Verify role mapping in IdProvider implementations
   - ✅ Enable debug logging to see extracted authorities

### Debug Configuration

Add to `application.properties` for debugging:

```properties
# Enable OAuth2 debug logging
logging.level.org.springframework.security.oauth2=DEBUG
logging.level.org.springframework.security.web=DEBUG
logging.level.com.example.springboot.config=DEBUG

# Log JWT token details
logging.level.org.springframework.security.oauth2.jwt=TRACE
```

### Testing Client Credentials

#### Keycloak Example
```bash
# Get client credentials token
curl -X POST "http://localhost:9180/realms/your-realm/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=your-client-id" \
  -d "client_secret=your-client-secret" \
  -d "scope=read write"

# Use token to call API
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8081/api/enquiries
```

#### Azure Entra ID Example
```bash
# Get client credentials token
curl -X POST "https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=your-client-id" \
  -d "client_secret=your-client-secret" \
  -d "scope=https://graph.microsoft.com/.default"

# Use token to call API
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8081/api/enquiries
```