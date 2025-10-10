# Environment Configuration Guide

This guide explains how to configure the application using environment variables and configuration files.

## Environment Variables

The application supports configuration through environment variables. Create a `.env` file in the project root with the following variables:

### Required Variables

```bash
# Authentication Configuration
KEYCLOAK_URL=http://localhost:9180
KEYCLOAK_REALM=quarkus-realm
KEYCLOAK_CLIENT_ID=quarkus-bamoe-frontend

# API Configuration
API_ENQUIRY_SERVICE=http://localhost:8081/api
API_PROCESS_SERVICE=http://localhost:8080
```

### Optional Variables

```bash
# Application Configuration
APP_NAME=Enquiry Process Management
APP_VERSION=1.0.0
APP_PORT=4200

# Authentication Options
KEYCLOAK_SCOPE=openid profile email
KEYCLOAK_SHOW_DEBUG=true
KEYCLOAK_USE_SILENT_REFRESH=true
KEYCLOAK_REQUIRE_HTTPS=false

# Feature Flags
ENABLE_DEBUG_MODE=true
ENABLE_ANALYTICS=false
ENABLE_ERROR_REPORTING=false

# UI Configuration
UI_THEME=indigo-pink
UI_SHOW_NAVIGATION=true
UI_COMPACT_MODE=false
```

## Environment Files

### Development (`src/environments/environment.ts`)

```typescript
export const environment = {
  production: false,
  auth: {
    provider: AuthProvider.KEYCLOAK,
    clientId: getEnvValue('KEYCLOAK_CLIENT_ID', 'quarkus-bamoe-frontend'),
    issuer: `${getEnvValue('KEYCLOAK_URL', 'http://localhost:9180')}/realms/${getEnvValue('KEYCLOAK_REALM', 'quarkus-realm')}`,
    realm: getEnvValue('KEYCLOAK_REALM', 'quarkus-realm'),
    scope: 'openid profile email',
    showDebugInformation: true,
    useSilentRefresh: true,
    requireHttps: false
  },
  api: {
    enquiryService: getEnvValue('API_ENQUIRY_SERVICE', 'http://localhost:8081/api'),
    processService: getEnvValue('API_PROCESS_SERVICE', 'http://localhost:8080')
  }
};
```

### Production (`src/environments/environment.prod.ts`)

```typescript
export const environment = {
  production: true,
  auth: {
    provider: AuthProvider.KEYCLOAK,
    clientId: getEnvValue('KEYCLOAK_CLIENT_ID', 'quarkus-bamoe-frontend'),
    issuer: `${getEnvValue('KEYCLOAK_URL', 'https://your-production-keycloak.com')}/realms/${getEnvValue('KEYCLOAK_REALM', 'quarkus-realm')}`,
    realm: getEnvValue('KEYCLOAK_REALM', 'quarkus-realm'),
    scope: 'openid profile email',
    showDebugInformation: false,
    useSilentRefresh: true,
    requireHttps: true
  },
  api: {
    enquiryService: getEnvValue('API_ENQUIRY_SERVICE', 'https://your-production-api.com/api'),
    processService: getEnvValue('API_PROCESS_SERVICE', 'https://your-production-process-service.com')
  }
};
```

## Configuration Service

The application includes a `ConfigService` for centralized configuration management:

```typescript
import { ConfigService } from './core/services/config.service';

// Get configuration
const config = this.configService.getConfig();

// Get specific configuration sections
const authConfig = this.configService.getAuthConfig();
const apiConfig = this.configService.getApiConfig();

// Check feature flags
const isDebugEnabled = this.configService.isFeatureEnabled('debugMode');
```

## Constants

Application constants are centralized in `src/app/core/constants/app.constants.ts`:

```typescript
import { APP_CONSTANTS } from './core/constants/app.constants';

// Use constants instead of hardcoded values
const titleMinLength = APP_CONSTANTS.VALIDATION.TITLE_MIN_LENGTH;
const statusColor = APP_CONSTANTS.STATUS_COLORS.OPEN;
```

## Docker Configuration

For Docker deployments, set environment variables in your `docker-compose.yml`:

```yaml
version: '3.8'
services:
  angular-app:
    build: .
    environment:
      - KEYCLOAK_URL=http://keycloak:8080
      - KEYCLOAK_REALM=quarkus-realm
      - KEYCLOAK_CLIENT_ID=quarkus-bamoe-frontend
      - API_ENQUIRY_SERVICE=http://api-service:8081/api
      - API_PROCESS_SERVICE=http://process-service:8080
    ports:
      - "4200:80"
```

## Build Configuration

### Development Build

```bash
npm run build
# Uses environment.ts
```

### Production Build

```bash
npm run build --configuration=production
# Uses environment.prod.ts
```

### Custom Environment

Create a custom environment file and update `angular.json`:

```json
{
  "projects": {
    "angula-bamoe-ui": {
      "architect": {
        "build": {
          "configurations": {
            "staging": {
              "fileReplacements": [
                {
                  "replace": "src/environments/environment.ts",
                  "with": "src/environments/environment.staging.ts"
                }
              ]
            }
          }
        }
      }
    }
  }
}
```

## Security Considerations

1. **Never commit `.env` files** to version control
2. **Use different configurations** for different environments
3. **Validate environment variables** at startup
4. **Use HTTPS in production** for all external services
5. **Rotate secrets regularly** in production

## Troubleshooting

### Common Issues

1. **Environment variables not loading**: Ensure `.env` file is in the project root
2. **CORS errors**: Check API service CORS configuration
3. **Authentication failures**: Verify Keycloak configuration and client settings
4. **Build failures**: Check that all required environment variables are set

### Debug Mode

Enable debug mode to see configuration values:

```typescript
// In environment.ts
auth: {
  showDebugInformation: true
}
```

This will log configuration values to the browser console.