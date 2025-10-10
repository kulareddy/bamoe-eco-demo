import { Observable } from 'rxjs';
import { UserInfo } from '../models/auth-config.model';

export interface IAuthService {
  // Initialization
  init(): Promise<boolean>;
  
  // Authentication state
  isAuthenticated(): boolean;
  
  // Login/Logout
  login(options?: any): Promise<void>;
  logout(options?: any): Promise<void>;
  
  // Token management
  getAccessToken(): string | null;
  getIdToken(): string | null;
  refreshToken(): Promise<void>;
  
  // User information
  getUserInfo(): Observable<UserInfo | null>;
  getUserClaims(): any;
  
  // Role/Permission management
  hasRole(role: string): boolean;
  hasAnyRole(roles: string[]): boolean;
  hasPermission(permission: string): boolean;
  getRoles(): string[];
  getGroups(): string[];
  
  // Events
  onAuthStateChanged(): Observable<boolean>;
  onTokenExpired(): Observable<void>;
  
  // Utility
  getUsername(): string;
  getUserId(): string;
  isTokenExpired(): boolean;
}