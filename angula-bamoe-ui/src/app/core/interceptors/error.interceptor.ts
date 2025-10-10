import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Unauthorized - redirect to login
        authService.login();
      } else if (error.status === 403) {
        // Forbidden - redirect to dashboard
        router.navigate(['/dashboard']);
      } else if (error.status >= 500) {
        // Server error - show error message
        console.error('Server error:', error);
      }
      
      return throwError(() => error);
    })
  );
};