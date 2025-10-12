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
          <button mat-raised-button color="primary" routerLink="/enquiries/new">
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
        <mat-card class="recent-enquiries-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon class="section-icon">history</mat-icon>
              Recent Enquiries
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="recentEnquiries.length === 0" class="no-items">
              <mat-icon>inbox</mat-icon>
              <p>No recent enquiries</p>
            </div>
            <div *ngFor="let enquiry of recentEnquiries" class="enquiry-item" [routerLink]="['/enquiries', enquiry.id]">
              <div class="enquiry-status-indicator" [class]="'status-' + enquiry.status.toLowerCase()"></div>
              <div class="enquiry-title">{{ enquiry.title }}</div>
              <span class="meta-chip">{{ enquiry.type }}</span>
              <span class="meta-chip status-chip" [class]="'status-' + enquiry.status.toLowerCase()">{{ enquiry.status }}</span>
              <span class="meta-reporter">{{ enquiry.reporter?.name || 'Unknown' }}</span>
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

    .recent-enquiries-card {
      mat-card-header {
        padding: 16px;
        background-color: #f5f5f5;
        margin: -16px -16px 16px -16px;
      }

      mat-card-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 20px;
        margin: 0;
      }

      .section-icon {
        color: #2196f3;
      }
    }

    .enquiry-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-bottom: 1px solid #eee;
      cursor: pointer;
      transition: background-color 0.2s;
      background-color: #fafafa;
      margin-bottom: 4px;
    }

    .enquiry-item:hover {
      background-color: #f0f0f0;
    }

    .enquiry-item:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }

    .enquiry-status-indicator {
      width: 4px;
      height: 24px;
      border-radius: 2px;
      flex-shrink: 0;

      &.status-open { background-color: #2196f3; }
      &.status-in_progress { background-color: #ff9800; }
      &.status-resolved { background-color: #4caf50; }
      &.status-closed { background-color: #9e9e9e; }
      &.status-cancelled { background-color: #f44336; }
    }

    .enquiry-title {
      font-weight: 500;
      color: #333;
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
    }

    .meta-chip {
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      background-color: #e0e0e0;
      color: #666;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .meta-chip.status-chip {
      font-weight: 500;

      &.status-open { background-color: #e3f2fd; color: #1976d2; }
      &.status-in_progress { background-color: #fff3e0; color: #f57c00; }
      &.status-resolved { background-color: #e8f5e9; color: #388e3c; }
      &.status-closed { background-color: #f5f5f5; color: #616161; }
      &.status-cancelled { background-color: #ffebee; color: #c62828; }
    }

    .meta-reporter {
      color: #666;
      font-size: 13px;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .no-items {
      text-align: center;
      color: #666;
      padding: 48px 24px;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #ccc;
        margin-bottom: 16px;
      }

      p {
        margin: 0;
        font-size: 16px;
      }
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
    // Load enquiries first, then try to load tasks (which may not be available)
    this.enquiryService.getEnquiries().subscribe({
      next: (allEnquiries) => {
        console.log('Dashboard - All enquiries received:', allEnquiries);
        console.log('Dashboard - First enquiry reporter:', allEnquiries[0]?.reporter);
        this.recentEnquiries = allEnquiries.slice(0, 5); // Get recent 5 enquiries
        
        // Try to load tasks, but don't fail if the endpoint doesn't exist
        this.processService.getAllTasks().subscribe({
          next: (tasks) => {
            this.calculateStats(allEnquiries, tasks);
            this.loading = false;
          },
          error: (taskError) => {
            console.warn('Tasks endpoint not available, using empty tasks array:', taskError);
            this.calculateStats(allEnquiries, []);
            this.loading = false;
          }
        });
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