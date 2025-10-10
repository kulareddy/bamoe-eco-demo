import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { Observable } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { UserInfo } from '../../../core/models/auth-config.model';

interface NavigationItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
}

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule
  ],
  template: `
    <mat-sidenav-container class="nav-container">
      <mat-sidenav 
        mode="side" 
        opened="true" 
        class="nav-sidenav"
        fixedInViewport="true"
        fixedTopGap="0">
        
        <!-- Header -->
        <mat-toolbar color="primary" class="nav-header">
          <mat-icon>business</mat-icon>
          <span class="nav-title">Enquiry System</span>
        </mat-toolbar>

        <!-- User Info -->
        <div class="user-info" *ngIf="userInfo$ | async as userInfo">
          <mat-icon class="user-avatar">account_circle</mat-icon>
          <div class="user-details">
            <div class="user-name">{{ userInfo.name || userInfo.preferred_username }}</div>
            <div class="user-email">{{ userInfo.email }}</div>
            <div class="user-roles" *ngIf="userInfo.roles && userInfo.roles.length > 0">
              <span class="role-badge" 
                    *ngFor="let role of userInfo.roles.slice(0, 2)"
                    [class]="role">
                {{ role }}
              </span>
              <span *ngIf="userInfo.roles.length > 2" class="more-roles">
                +{{ userInfo.roles.length - 2 }} more
              </span>
            </div>
          </div>
        </div>

        <!-- Navigation Menu -->
        <mat-nav-list class="nav-menu">
          <mat-list-item 
            *ngFor="let item of getVisibleNavItems()" 
            [routerLink]="item.route"
            routerLinkActive="active">
            <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
            <span matListItemTitle>{{ item.label }}</span>
          </mat-list-item>
        </mat-nav-list>

        <!-- Footer Actions -->
        <div class="nav-footer">
          <button mat-button (click)="authService.logout()" class="logout-btn">
            <mat-icon>logout</mat-icon>
            Logout
          </button>
        </div>
      </mat-sidenav>
      
      <mat-sidenav-content class="nav-content">
        <ng-content></ng-content>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .nav-container {
      height: 100vh;
    }

    .nav-sidenav {
      width: 250px;
      background-color: #fafafa;
      border-right: 1px solid #e0e0e0;
    }

    .nav-header {
      padding: 16px;
      gap: 12px;
    }

    .nav-title {
      font-weight: 500;
    }

    .user-info {
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .user-avatar {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #666;
      margin-top: 4px;
    }

    .user-details {
      flex: 1;
      min-width: 0;
    }

    .user-name {
      font-weight: 500;
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-email {
      color: #666;
      font-size: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 8px;
    }

    .user-roles {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      align-items: center;
    }

    .role-badge {
      background-color: #e0e0e0;
      color: #333;
      padding: 2px 6px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 500;
      text-transform: uppercase;
      
      &.admin { background-color: #9c27b0; color: white; }
      &.manager { background-color: #3f51b5; color: white; }
      &.user { background-color: #607d8b; color: white; }
      &.analyst { background-color: #009688; color: white; }
      &.tech-support { background-color: #ff5722; color: white; }
      &.business-support { background-color: #795548; color: white; }
    }

    .more-roles {
      font-size: 10px;
      color: #666;
    }

    .nav-menu {
      flex: 1;
      padding-top: 8px;
    }

    .nav-menu mat-list-item {
      margin: 4px 8px;
      border-radius: 8px;
      transition: background-color 0.2s;
    }

    .nav-menu mat-list-item:hover {
      background-color: #f0f0f0;
    }

    .nav-menu mat-list-item.active {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .nav-footer {
      padding: 16px;
      border-top: 1px solid #e0e0e0;
    }

    .logout-btn {
      width: 100%;
      justify-content: flex-start;
      gap: 8px;
    }

    .nav-content {
      padding: 0;
      overflow: auto;
    }
  `]
})
export class NavigationComponent implements OnInit {
  userInfo$: Observable<UserInfo | null>;

  private navigationItems: NavigationItem[] = [
    { label: 'Home', icon: 'home', route: '/home' },
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Enquiries', icon: 'help_outline', route: '/enquiries' },
    { label: 'My Tasks', icon: 'task', route: '/tasks' },
    { label: 'Profile', icon: 'account_circle', route: '/profile' },
    { label: 'Admin', icon: 'admin_panel_settings', route: '/admin', roles: ['admin'] },
  ];

  constructor(public authService: AuthService) {
    this.userInfo$ = this.authService.getUserInfo();
  }

  ngOnInit(): void {}

  getVisibleNavItems(): NavigationItem[] {
    return this.navigationItems.filter(item => {
      if (!item.roles || item.roles.length === 0) {
        return true;
      }
      return this.authService.hasAnyRole(item.roles);
    });
  }
}