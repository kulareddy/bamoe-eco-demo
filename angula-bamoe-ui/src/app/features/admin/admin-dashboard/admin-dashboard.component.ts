import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ],
  template: `
    <div class="admin-dashboard-container">
      <h1>Administration Dashboard</h1>
      
      <div class="admin-cards">
        <mat-card class="admin-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>people</mat-icon>
              User Management
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Manage users, roles, and permissions</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" routerLink="/admin/users">
              Manage Users
            </button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="admin-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>settings</mat-icon>
              System Configuration
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Configure system settings and parameters</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button disabled>
              Coming Soon
            </button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="admin-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>analytics</mat-icon>
              Reports & Analytics
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>View system reports and analytics</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button disabled>
              Coming Soon
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      margin-bottom: 24px;
      color: #333;
    }

    .admin-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    .admin-card {
      transition: transform 0.2s;
    }

    .admin-card:hover {
      transform: translateY(-2px);
    }

    .admin-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class AdminDashboardComponent {}