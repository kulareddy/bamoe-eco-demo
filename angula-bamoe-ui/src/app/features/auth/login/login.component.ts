import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>business</mat-icon>
            Enquiry Process Management
          </mat-card-title>
          <mat-card-subtitle>
            Please sign in to access the enquiry management system
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <div class="login-content">
            <div *ngIf="loading" class="loading-section">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Checking authentication...</p>
            </div>

            <div *ngIf="!loading" class="login-section">
              <div class="welcome-text">
                <h2>Welcome Back</h2>
                <p>Sign in to manage your enquiries and track their progress through our case management system.</p>
              </div>

              <button mat-raised-button color="primary" (click)="login()" class="login-button">
                <mat-icon>login</mat-icon>
                Sign In with Keycloak
              </button>

              <div class="features">
                <h3>What you can do:</h3>
                <ul>
                  <li><mat-icon>add</mat-icon>Create new enquiries</li>
                  <li><mat-icon>visibility</mat-icon>Track enquiry status</li>
                  <li><mat-icon>assignment</mat-icon>Manage tasks and processes</li>
                  <li><mat-icon>analytics</mat-icon>View analytics and reports</li>
                </ul>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      max-width: 500px;
      width: 100%;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .login-card mat-card-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .login-card mat-card-title {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: #1976d2;
      font-size: 1.5rem;
    }

    .login-content {
      padding: 20px 0;
    }

    .loading-section {
      text-align: center;
      padding: 40px 20px;
    }

    .loading-section p {
      margin-top: 16px;
      color: #666;
    }

    .login-section {
      text-align: center;
    }

    .welcome-text h2 {
      color: #333;
      margin-bottom: 16px;
    }

    .welcome-text p {
      color: #666;
      margin-bottom: 32px;
      line-height: 1.6;
    }

    .login-button {
      padding: 12px 32px;
      font-size: 16px;
      margin-bottom: 32px;
    }

    .login-button mat-icon {
      margin-right: 8px;
    }

    .features {
      text-align: left;
      background: #f8f9fa;
      padding: 24px;
      border-radius: 8px;
      margin-top: 24px;
    }

    .features h3 {
      margin-top: 0;
      color: #333;
      margin-bottom: 16px;
    }

    .features ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .features li {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
      color: #666;
    }

    .features li mat-icon {
      color: #1976d2;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    @media (max-width: 600px) {
      .login-container {
        padding: 10px;
      }
      
      .login-card {
        margin: 0;
      }
    }
  `]
})
export class LoginComponent implements OnInit, OnDestroy {
  loading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is already authenticated
    this.authService.onAuthStateChanged()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAuthenticated => {
        this.loading = false;
        if (isAuthenticated) {
          this.redirectAfterLogin();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  login(): void {
    this.loading = true;
    this.authService.login().then(() => {
      this.loading = false;
    }).catch(error => {
      console.error('Login error:', error);
      this.loading = false;
    });
  }

  private redirectAfterLogin(): void {
    const redirectUrl = localStorage.getItem('redirectUrl') || '/home';
    localStorage.removeItem('redirectUrl');
    this.router.navigate([redirectUrl]);
  }
}