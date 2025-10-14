import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { OAuthService, AuthConfig, OAuthEvent, OAuthErrorEvent } from 'angular-oauth2-oidc';
import { JwksValidationHandler } from 'angular-oauth2-oidc-jwks';
import { filter, map } from 'rxjs/operators';

import { IAuthService } from '../interfaces/auth.interface';
import { AuthConfig as AppAuthConfig, UserInfo, AuthProvider } from '../models/auth-config.model';
import { User } from '../models/enquiry.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements IAuthService {
  private userInfo$ = new BehaviorSubject<UserInfo | null>(null);
  private authState$ = new BehaviorSubject<boolean>(false);
  private appAuthConfig: AppAuthConfig | null = null;

  constructor(private oauthService: OAuthService) {
    this.setupOAuthEvents();
  }

  async init(): Promise<boolean> {
    try {
      const config = this.getAuthConfigFromEnvironment();
      this.appAuthConfig = config;
      
      const oauthConfig = this.mapToOAuthConfig(config);
      this.oauthService.configure(oauthConfig);
      this.oauthService.tokenValidationHandler = new JwksValidationHandler();
      
      await this.oauthService.loadDiscoveryDocumentAndTryLogin();
      
      if (this.oauthService.hasValidAccessToken()) {
        await this.loadUserInfo();
        this.authState$.next(true);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Auth initialization failed:', error);
      return false;
    }
  }

  private getAuthConfigFromEnvironment(): AppAuthConfig {
    // Get configuration from environment
    const config = environment.auth;
    const baseConfig = {
      provider: config.provider,
      clientId: config.clientId,
      issuer: config.issuer,
      scope: config.scope,
      showDebugInformation: config.showDebugInformation,
      useSilentRefresh: config.useSilentRefresh,
      silentRefreshRedirectUri: window.location.origin + '/assets/silent-refresh.html'
    };

    // Add realm property only for Keycloak provider
    if (config.provider === AuthProvider.KEYCLOAK && 'realm' in config) {
      return {
        ...baseConfig,
        realm: config.realm
      } as AppAuthConfig;
    }

    return baseConfig as AppAuthConfig;
  }

  private mapToOAuthConfig(config: AppAuthConfig): AuthConfig {
    const baseConfig: AuthConfig = {
      issuer: config.issuer,
      clientId: config.clientId,
      responseType: 'code',
      redirectUri: config.redirectUri || window.location.origin,
      scope: config.scope,
      showDebugInformation: config.showDebugInformation || false,
      requireHttps: config.requireHttps ?? (window.location.protocol === 'https:')
    };

    // Provider-specific configurations
    switch (config.provider) {
      case AuthProvider.KEYCLOAK:
        return {
          ...baseConfig,
          strictDiscoveryDocumentValidation: false
        };
        
      case AuthProvider.ENTRA_ID:
        return {
          ...baseConfig,
          strictDiscoveryDocumentValidation: true,
          oidc: true
        };
        
      case AuthProvider.AUTH0:
        return {
          ...baseConfig,
          strictDiscoveryDocumentValidation: true,
          oidc: true
        };
        
      default:
        return baseConfig;
    }
  }

  private setupOAuthEvents(): void {
    this.oauthService.events
      .pipe(filter(e => e.type === 'token_received'))
      .subscribe(() => {
        this.loadUserInfo();
        this.authState$.next(true);
      });

    this.oauthService.events
      .pipe(filter(e => e.type === 'logout'))
      .subscribe(() => {
        this.userInfo$.next(null);
        this.authState$.next(false);
      });

    this.oauthService.events
      .pipe(filter(e => e.type === 'token_error' || e.type === 'token_refresh_error'))
      .subscribe((e: OAuthEvent) => {
        console.error('OAuth error:', e);
        this.authState$.next(false);
      });
  }

  private async loadUserInfo(): Promise<void> {
    try {
      const claims = this.oauthService.getIdentityClaims();
      console.log('Raw claims from token:', claims);
      
      if (claims) {
        const userInfo: UserInfo = {
          sub: claims['sub'],
          name: claims['name'] || `${claims['given_name'] || ''} ${claims['family_name'] || ''}`.trim(),
          given_name: claims['given_name'],
          family_name: claims['family_name'],
          email: claims['email'],
          email_verified: claims['email_verified'],
          preferred_username: claims['preferred_username'],
          roles: this.extractRoles(claims),
          groups: this.extractGroups(claims),
          ...claims
        };
        console.log('Processed user info:', userInfo);
        this.userInfo$.next(userInfo);
      } else {
        console.log('No claims available from token');
      }
    } catch (error) {
      console.error('Failed to load user info:', error);
    }
  }

  private extractRoles(claims: any): string[] {
    // Handle different role claim structures based on provider
    if (this.appAuthConfig?.provider === AuthProvider.KEYCLOAK) {
      return claims['realm_access']?.roles || claims['roles'] || [];
    } else if (this.appAuthConfig?.provider === AuthProvider.ENTRA_ID) {
      return claims['roles'] || [];
    } else if (this.appAuthConfig?.provider === AuthProvider.AUTH0) {
      return claims['https://yourapp.com/roles'] || claims['roles'] || [];
    }
    return claims['roles'] || [];
  }

  private extractGroups(claims: any): string[] {
    // Handle different group claim structures based on provider
    if (this.appAuthConfig?.provider === AuthProvider.KEYCLOAK) {
      // Keycloak might store groups in different claims
      return claims['groups'] || 
             claims['realm_access']?.groups || 
             claims['resource_access']?.[this.appAuthConfig.clientId]?.groups ||
             [];
    } else if (this.appAuthConfig?.provider === AuthProvider.ENTRA_ID) {
      return claims['groups'] || [];
    } else if (this.appAuthConfig?.provider === AuthProvider.AUTH0) {
      return claims['https://yourapp.com/groups'] || claims['groups'] || [];
    }
    return claims['groups'] || [];
  }

  // IAuthService implementation
  isAuthenticated(): boolean {
    return this.oauthService.hasValidAccessToken();
  }

  async login(options?: any): Promise<void> {
    this.oauthService.initCodeFlow();
  }

  async logout(options?: any): Promise<void> {
    this.oauthService.logOut();
  }

  getAccessToken(): string | null {
    return this.oauthService.getAccessToken();
  }

  getIdToken(): string | null {
    return this.oauthService.getIdToken();
  }

  async refreshToken(): Promise<void> {
    await this.oauthService.refreshToken();
  }

  getUserInfo(): Observable<UserInfo | null> {
    return this.userInfo$.asObservable();
  }

  getUserClaims(): any {
    return this.oauthService.getIdentityClaims();
  }

  hasRole(role: string): boolean {
    const userInfo = this.userInfo$.value;
    return userInfo?.roles?.includes(role) || false;
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  hasPermission(permission: string): boolean {
    // Implement permission logic based on your requirements
    // This could check against roles, groups, or specific permission claims
    return this.hasRole(permission);
  }

  getRoles(): string[] {
    const userInfo = this.userInfo$.value;
    return userInfo?.roles || [];
  }

  getGroups(): string[] {
    const userInfo = this.userInfo$.value;
    return userInfo?.groups || [];
  }

  onAuthStateChanged(): Observable<boolean> {
    return this.authState$.asObservable();
  }

  onTokenExpired(): Observable<void> {
    return this.oauthService.events
      .pipe(
        filter(e => e.type === 'token_expires'),
        map(() => void 0)
      );
  }

  getUsername(): string {
    const userInfo = this.userInfo$.value;
    return userInfo?.preferred_username || userInfo?.name || userInfo?.email || '';
  }

  getUserId(): string {
    const userInfo = this.userInfo$.value;
    return userInfo?.sub || '';
  }

  isTokenExpired(): boolean {
    return this.oauthService.hasValidAccessToken() === false;
  }

  // Additional methods for accessing user claims
  getAllClaims(): any {
    return this.oauthService.getIdentityClaims();
  }

  getClaimValue(claimName: string): any {
    const claims = this.getAllClaims();
    return claims ? claims[claimName] : null;
  }

  hasClaim(claimName: string): boolean {
    return this.getClaimValue(claimName) !== null && this.getClaimValue(claimName) !== undefined;
  }

  getCustomClaims(): Record<string, any> {
    const allClaims = this.getAllClaims();
    if (!allClaims) return {};
    
    const standardClaims = ['sub', 'name', 'given_name', 'family_name', 'email', 'email_verified', 'preferred_username', 'iat', 'exp', 'iss', 'aud', 'azp', 'session_state', 'realm_access', 'resource_access', 'scope', 'sid', 'groups', 'roles'];
    
    const customClaims: Record<string, any> = {};
    Object.keys(allClaims).forEach(key => {
      if (!standardClaims.includes(key)) {
        customClaims[key] = allClaims[key];
      }
    });
    
    return customClaims;
  }

  getUserProfileSummary(): { name: string; email: string; roles: string[]; groups: string[]; customClaimsCount: number } {
    const userInfo = this.userInfo$.value;
    const customClaims = this.getCustomClaims();
    
    return {
      name: userInfo?.name || 'Unknown',
      email: userInfo?.email || 'Unknown',
      roles: userInfo?.roles || [],
      groups: userInfo?.groups || [],
      customClaimsCount: Object.keys(customClaims).length
    };
  }

  getCurrentUser(): User | null {
    const userInfo = this.userInfo$.value;
    if (!userInfo) {
      console.log('No user info available');
      return null;
    }
    
    console.log('User info from token:', userInfo);
    console.log('User sub:', userInfo.sub);
    console.log('User preferred_username:', userInfo.preferred_username);
    console.log('User name:', userInfo.name);
    console.log('User email:', userInfo.email);
    
    const user: User = {
      userId: userInfo.preferred_username || userInfo.sub || '',
      name: userInfo.name || userInfo.preferred_username || 'Unknown User',
      email: userInfo.email || '',
      roles: userInfo.roles || []
    };
    
    console.log('Mapped user - userId:', user.userId, 'name:', user.name, 'email:', user.email);
    return user;
  }
}