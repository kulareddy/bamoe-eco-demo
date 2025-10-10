import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { RouterModule } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

import { EnquiryService } from '../../core/services/enquiry.service';
import { ProcessService } from '../../core/services/process.service';
import { AuthService } from '../../core/services/auth.service';
import { Enquiry, EnquiryStatus } from '../../core/models/enquiry.model';
import { Task } from '../../core/models/process.model';

interface DashboardStats {
  totalEnquiries: number;
  openEnquiries: number;
  myTasks: number;
  completedToday: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule,
    RouterModule
  ],
  template: `
    <div class="dashboard-container">
      <h1>Dashboard</h1>
      
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon total">help_outline</mat-icon>
              <div class="stat-details">
                <div class="stat-number">{{ stats.totalEnquiries }}</div>
                <div class="stat-label">Total Enquiries</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon open">schedule</mat-icon>
              <div class="stat-details">
                <div class="stat-number">{{ stats.openEnquiries }}</div>
                <div class="stat-label">Open Enquiries</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon tasks">task</mat-icon>
              <div class="stat-details">
                <div class="stat-number">{{ stats.myTasks }}</div>
                <div class="stat-label">My Tasks</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon completed">check_circle</mat-icon>
              <div class="stat-details">
                <div class="stat-number">{{ stats.completedToday }}</div>
                <div class="stat-label">Completed Today</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="action-buttons">
          <button mat-raised-button color="primary" routerLink="/enquiries/create">
            <mat-icon>add</mat-icon>
            Create Enquiry
          </button>
          <button mat-raised-button routerLink="/enquiries">
            <mat-icon>list</mat-icon>
            View All Enquiries
          </button>
          <button mat-raised-button routerLink="/tasks">
            <mat-icon>task</mat-icon>
            My Tasks
          </button>
        </div>
      </div>

      <div class="recent-items">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Recent Enquiries</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="recentEnquiries.length === 0" class="no-items">
              No recent enquiries
            </div>
            <div *ngFor="let enquiry of recentEnquiries" class="enquiry-item">
              <div class="enquiry-info">
                <div class="enquiry-title">{{ enquiry.title }}</div>
                <div class="enquiry-meta">{{ enquiry.type }} • {{ enquiry.status }}</div>
              </div>
              <button mat-icon-button [routerLink]="['/enquiries', enquiry.id]">
                <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      margin-bottom: 24px;
      color: #333;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }

    .stat-card {
      cursor: pointer;
      transition: transform 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      
      &.total { color: #2196f3; }
      &.open { color: #ff9800; }
      &.tasks { color: #9c27b0; }
      &.completed { color: #4caf50; }
    }

    .stat-details {
      flex: 1;
    }

    .stat-number {
      font-size: 32px;
      font-weight: bold;
      line-height: 1;
    }

    .stat-label {
      color: #666;
      font-size: 14px;
    }

    .quick-actions {
      margin-bottom: 32px;
    }

    .quick-actions h2 {
      margin-bottom: 16px;
      color: #333;
    }

    .action-buttons {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .action-buttons button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .recent-items {
      margin-bottom: 32px;
    }

    .enquiry-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #eee;
    }

    .enquiry-item:last-child {
      border-bottom: none;
    }

    .enquiry-info {
      flex: 1;
    }

    .enquiry-title {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .enquiry-meta {
      color: #666;
      font-size: 14px;
    }

    .no-items {
      text-align: center;
      color: #666;
      padding: 24px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalEnquiries: 0,
    openEnquiries: 0,
    myTasks: 0,
    completedToday: 0
  };
  
  recentEnquiries: Enquiry[] = [];
  loading = true;

  constructor(
    private enquiryService: EnquiryService,
    private processService: ProcessService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    forkJoin({
      allEnquiries: this.enquiryService.getEnquiries(),
      myTasks: this.processService.getAllTasks({ assignee: this.authService.getUsername() }),
      recentEnquiries: this.enquiryService.getEnquiries({ page: 0, size: 5, sort: 'createdAt,desc' })
    }).subscribe({
      next: (data) => {
        this.calculateStats(data.allEnquiries, data.myTasks);
        this.recentEnquiries = data.recentEnquiries;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
      }
    });
  }

  private calculateStats(enquiries: Enquiry[], tasks: Task[]): void {
    this.stats = {
      totalEnquiries: enquiries.length,
      openEnquiries: enquiries.filter(e => e.status === EnquiryStatus.OPEN).length,
      myTasks: tasks.length,
      completedToday: this.getCompletedToday(enquiries)
    };
  }

  private getCompletedToday(enquiries: Enquiry[]): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return enquiries.filter(e => {
      if (!e.updatedAt || e.status !== EnquiryStatus.RESOLVED) {
        return false;
      }
      const updatedDate = new Date(e.updatedAt);
      updatedDate.setHours(0, 0, 0, 0);
      return updatedDate.getTime() === today.getTime();
    }).length;
  }
}