import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule
  ],
  template: `
    <div class="user-management-container">
      <div class="header">
        <h1>User Management</h1>
        <button mat-raised-button color="primary" disabled>
          <mat-icon>add</mat-icon>
          Add User
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <p>User management is typically handled through Keycloak Admin Console.</p>
          <p>Access the Keycloak Admin Console at: <strong>{{ keycloakAdminUrl }}</strong></p>
          <p>Default credentials: <strong>admin / admin123</strong></p>
          
          <div class="info-section">
            <h3>Available Roles:</h3>
            <div class="role-chips">
              <mat-chip class="role-chip admin">admin</mat-chip>
              <mat-chip class="role-chip manager">manager</mat-chip>
              <mat-chip class="role-chip user">user</mat-chip>
              <mat-chip class="role-chip analyst">analyst</mat-chip>
              <mat-chip class="role-chip tech-support">tech-support</mat-chip>
              <mat-chip class="role-chip business-support">business-support</mat-chip>
            </div>
          </div>

          <div class="info-section">
            <h3>Default Users:</h3>
            <table mat-table [dataSource]="defaultUsers" class="users-table">
              <ng-container matColumnDef="username">
                <th mat-header-cell *matHeaderCellDef>Username</th>
                <td mat-cell *matCellDef="let user">{{ user.username }}</td>
              </ng-container>

              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef>Email</th>
                <td mat-cell *matCellDef="let user">{{ user.email }}</td>
              </ng-container>

              <ng-container matColumnDef="role">
                <th mat-header-cell *matHeaderCellDef>Primary Role</th>
                <td mat-cell *matCellDef="let user">
                  <mat-chip [class]="'role-chip ' + user.role">{{ user.role }}</mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="password">
                <th mat-header-cell *matHeaderCellDef>Password</th>
                <td mat-cell *matCellDef="let user">{{ user.password }}</td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .user-management-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header h1 {
      margin: 0;
      color: #333;
    }

    .info-section {
      margin: 24px 0;
    }

    .info-section h3 {
      margin-bottom: 16px;
      color: #666;
    }

    .role-chips {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .users-table {
      width: 100%;
      margin-top: 16px;
    }

    .role-chip {
      &.admin { background-color: #9c27b0; color: white; }
      &.manager { background-color: #3f51b5; color: white; }
      &.user { background-color: #607d8b; color: white; }
      &.analyst { background-color: #009688; color: white; }
      &.tech-support { background-color: #ff5722; color: white; }
      &.business-support { background-color: #795548; color: white; }
    }
  `]
})
export class UserManagementComponent {
  displayedColumns = ['username', 'email', 'role', 'password'];
  keycloakAdminUrl = environment.auth.issuer?.replace('/realms/', '/admin') || 'http://localhost:9180/admin';
  
  defaultUsers = [
    { username: 'admin', email: 'admin@example.com', role: 'admin', password: 'admin123' },
    { username: 'manager1', email: 'manager1@example.com', role: 'manager', password: 'manager123' },
    { username: 'user1', email: 'user1@example.com', role: 'user', password: 'user123' },
    { username: 'analyst1', email: 'analyst1@example.com', role: 'analyst', password: 'analyst123' },
    { username: 'tech1', email: 'tech1@example.com', role: 'tech-support', password: 'tech123' },
    { username: 'business1', email: 'business1@example.com', role: 'business-support', password: 'business123' }
  ];
}