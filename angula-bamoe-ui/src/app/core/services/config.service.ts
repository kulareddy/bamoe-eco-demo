import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface AppConfig {
  app: {
    name: string;
    version: string;
    port: number;
  };
  auth: {
    provider: string;
    keycloak: {
      url: string;
      realm: string;
      clientId: string;
      scope: string;
      showDebug: boolean;
      useSilentRefresh: boolean;
      requireHttps: boolean;
    };
  };
  api: {
    enquiryService: string;
    processService: string;
  };
  features: {
    debugMode: boolean;
    analytics: boolean;
    errorReporting: boolean;
  };
  ui: {
    theme: string;
    showNavigation: boolean;
    compactMode: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: AppConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): AppConfig {
    return {
      app: {
        name: this.getEnvValue('APP_NAME', 'Enquiry Process Management'),
        version: this.getEnvValue('APP_VERSION', '1.0.0'),
        port: parseInt(this.getEnvValue('APP_PORT', '4200'), 10)
      },
      auth: {
        provider: this.getEnvValue('AUTH_PROVIDER', 'keycloak'),
        keycloak: {
          url: this.getEnvValue('KEYCLOAK_URL', environment.auth.issuer?.split('/realms/')[0] || 'http://localhost:9180'),
          realm: this.getEnvValue('KEYCLOAK_REALM', environment.auth.realm || 'quarkus-realm'),
          clientId: this.getEnvValue('KEYCLOAK_CLIENT_ID', environment.auth.clientId || 'quarkus-bamoe-frontend'),
          scope: this.getEnvValue('KEYCLOAK_SCOPE', environment.auth.scope || 'openid profile email'),
          showDebug: this.getEnvValue('KEYCLOAK_SHOW_DEBUG', 'true') === 'true',
          useSilentRefresh: this.getEnvValue('KEYCLOAK_USE_SILENT_REFRESH', 'true') === 'true',
          requireHttps: this.getEnvValue('KEYCLOAK_REQUIRE_HTTPS', 'false') === 'true'
        }
      },
      api: {
        enquiryService: this.getEnvValue('API_ENQUIRY_SERVICE', environment.api.enquiryService),
        processService: this.getEnvValue('API_PROCESS_SERVICE', environment.api.processService)
      },
      features: {
        debugMode: this.getEnvValue('ENABLE_DEBUG_MODE', 'true') === 'true',
        analytics: this.getEnvValue('ENABLE_ANALYTICS', 'false') === 'true',
        errorReporting: this.getEnvValue('ENABLE_ERROR_REPORTING', 'false') === 'true'
      },
      ui: {
        theme: this.getEnvValue('UI_THEME', 'indigo-pink'),
        showNavigation: this.getEnvValue('UI_SHOW_NAVIGATION', 'true') === 'true',
        compactMode: this.getEnvValue('UI_COMPACT_MODE', 'false') === 'true'
      }
    };
  }

  private getEnvValue(key: string, defaultValue: string): string {
    // In a real application, you would use a library like dotenv
    // For now, we'll fall back to environment files
    return defaultValue;
  }

  getConfig(): AppConfig {
    return this.config;
  }

  getAppConfig() {
    return this.config.app;
  }

  getAuthConfig() {
    return this.config.auth;
  }

  getApiConfig() {
    return this.config.api;
  }

  getFeatureConfig() {
    return this.config.features;
  }

  getUiConfig() {
    return this.config.ui;
  }

  isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
    return this.config.features[feature];
  }

  getApiUrl(service: keyof AppConfig['api']): string {
    return this.config.api[service];
  }

  getKeycloakConfig() {
    return this.config.auth.keycloak;
  }
}