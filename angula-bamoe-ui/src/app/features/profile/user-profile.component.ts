import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { UserInfo } from '../../core/models/auth-config.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule,
    MatExpansionModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="profile-container">
      <mat-card class="profile-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>account_circle</mat-icon>
            User Profile & Claims
          </mat-card-title>
          <mat-card-subtitle>
            Complete user information from Keycloak
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <div *ngIf="userInfo$ | async as userInfo; else loading" class="profile-content">
            <!-- Basic Information -->
            <div class="profile-section">
              <h3>
                <mat-icon>person</mat-icon>
                Basic Information
              </h3>
              <div class="info-grid">
                <div class="info-item">
                  <label>Name:</label>
                  <span>{{ userInfo.name || 'Not provided' }}</span>
                </div>
                <div class="info-item">
                  <label>Email:</label>
                  <span>{{ userInfo.email || 'Not provided' }}</span>
                </div>
                <div class="info-item">
                  <label>Username:</label>
                  <span>{{ userInfo.preferred_username || 'Not provided' }}</span>
                </div>
                <div class="info-item">
                  <label>User ID:</label>
                  <span class="user-id">{{ userInfo.sub }}</span>
                </div>
                <div class="info-item">
                  <label>Email Verified:</label>
                  <mat-chip [class]="userInfo.email_verified ? 'verified' : 'not-verified'">
                    {{ userInfo.email_verified ? 'Verified' : 'Not Verified' }}
                  </mat-chip>
                </div>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Roles -->
            <div class="profile-section" *ngIf="userInfo.roles && userInfo.roles.length > 0">
              <h3>
                <mat-icon>security</mat-icon>
                Roles ({{ userInfo.roles.length }})
              </h3>
              <div class="chips-container">
                <mat-chip 
                  *ngFor="let role of userInfo.roles" 
                  [class]="getRoleClass(role)"
                  class="role-chip">
                  {{ role }}
                </mat-chip>
              </div>
            </div>

            <mat-divider *ngIf="userInfo.roles && userInfo.roles.length > 0"></mat-divider>

            <!-- Groups -->
            <div class="profile-section" *ngIf="userInfo.groups && userInfo.groups.length > 0">
              <h3>
                <mat-icon>group</mat-icon>
                Groups ({{ userInfo.groups.length }})
              </h3>
              <div class="chips-container">
                <mat-chip 
                  *ngFor="let group of userInfo.groups" 
                  class="group-chip">
                  {{ group }}
                </mat-chip>
              </div>
            </div>

            <mat-divider *ngIf="userInfo.groups && userInfo.groups.length > 0"></mat-divider>

            <!-- Additional Claims -->
            <div class="profile-section">
              <h3>
                <mat-icon>info</mat-icon>
                Additional Claims
              </h3>
              <mat-expansion-panel>
                <mat-expansion-panel-header>
                  <mat-panel-title>View All Claims</mat-panel-title>
                  <mat-panel-description>
                    {{ getAdditionalClaimsCount(userInfo) }} additional claims
                  </mat-panel-description>
                </mat-expansion-panel-header>
                <div class="claims-content">
                  <div *ngFor="let claim of getAdditionalClaims(userInfo)" class="claim-item">
                    <label>{{ claim.key }}:</label>
                    <span>{{ claim.value }}</span>
                  </div>
                </div>
              </mat-expansion-panel>
            </div>

            <mat-divider></mat-divider>

            <!-- Actions -->
            <div class="profile-actions">
              <button mat-raised-button color="primary" (click)="refreshProfile()">
                <mat-icon>refresh</mat-icon>
                Refresh Profile
              </button>
              <button mat-button (click)="copyUserInfo(userInfo)">
                <mat-icon>content_copy</mat-icon>
                Copy User Info
              </button>
            </div>
          </div>

          <ng-template #loading>
            <div class="loading-container">
              <mat-icon>hourglass_empty</mat-icon>
              <p>Loading user profile...</p>
            </div>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
    }

    .profile-card {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .profile-card mat-card-header {
      margin-bottom: 24px;
    }

    .profile-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #1976d2;
    }

    .profile-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .profile-section h3 {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #333;
      margin-bottom: 16px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-item label {
      font-weight: 500;
      color: #666;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-item span {
      color: #333;
      word-break: break-all;
    }

    .user-id {
      font-family: monospace;
      background-color: #f5f5f5;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
    }

    .chips-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .role-chip {
      font-weight: 500;
      text-transform: uppercase;
      font-size: 12px;
    }

    .role-chip.admin {
      background-color: #9c27b0;
      color: white;
    }

    .role-chip.manager {
      background-color: #3f51b5;
      color: white;
    }

    .role-chip.user {
      background-color: #607d8b;
      color: white;
    }

    .role-chip.analyst {
      background-color: #009688;
      color: white;
    }

    .role-chip.tech-support {
      background-color: #ff5722;
      color: white;
    }

    .role-chip.business-support {
      background-color: #795548;
      color: white;
    }

    .group-chip {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .verified {
      background-color: #e8f5e8;
      color: #388e3c;
    }

    .not-verified {
      background-color: #ffebee;
      color: #d32f2f;
    }

    .claims-content {
      max-height: 300px;
      overflow-y: auto;
      padding: 16px 0;
    }

    .claim-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }

    .claim-item:last-child {
      border-bottom: none;
    }

    .claim-item label {
      font-weight: 500;
      color: #666;
      min-width: 150px;
    }

    .claim-item span {
      color: #333;
      word-break: break-all;
      text-align: right;
    }

    .profile-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-top: 24px;
    }

    .profile-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .loading-container {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .loading-container mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      margin-bottom: 16px;
    }

    @media (max-width: 768px) {
      .info-grid {
        grid-template-columns: 1fr;
      }
      
      .profile-actions {
        flex-direction: column;
      }
    }
  `]
})
export class UserProfileComponent implements OnInit, OnDestroy {
  userInfo$ = this.authService.getUserInfo();
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  refreshProfile(): void {
    // Force refresh of user info
    this.authService.getUserInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe(userInfo => {
        if (userInfo) {
          this.snackBar.open('Profile refreshed successfully', 'Close', { duration: 2000 });
        }
      });
  }

  copyUserInfo(userInfo: UserInfo): void {
    const userInfoText = JSON.stringify(userInfo, null, 2);
    navigator.clipboard.writeText(userInfoText).then(() => {
      this.snackBar.open('User info copied to clipboard', 'Close', { duration: 2000 });
    }).catch(() => {
      this.snackBar.open('Failed to copy user info', 'Close', { duration: 2000 });
    });
  }

  getRoleClass(role: string): string {
    return role.toLowerCase().replace('_', '-');
  }

  getAdditionalClaims(userInfo: UserInfo): { key: string; value: any }[] {
    const excludedKeys = ['sub', 'name', 'given_name', 'family_name', 'email', 'email_verified', 'preferred_username', 'roles', 'groups'];
    return Object.entries(userInfo)
      .filter(([key]) => !excludedKeys.includes(key))
      .map(([key, value]) => ({ key, value }));
  }

  getAdditionalClaimsCount(userInfo: UserInfo): number {
    return this.getAdditionalClaims(userInfo).length;
  }
}