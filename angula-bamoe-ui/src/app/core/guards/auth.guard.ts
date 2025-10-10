import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isLoggedIn = authService.isAuthenticated();
  
  if (!isLoggedIn) {
    // Store the attempted URL for redirect after login
    localStorage.setItem('redirectUrl', state.url);
    await authService.login();
    return false;
  }
  
  return true;
};