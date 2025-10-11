import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

import { EnquiryService } from '../../core/services/enquiry.service';
import { ProcessService } from '../../core/services/process.service';
import { Enquiry, EnquiryStatus, EnquiryType } from '../../core/models/enquiry.model';
import { ProcessInstance } from '../../core/models/process.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="home-container">
      <div class="welcome-section">
        <h1>Welcome to Enquiry Management</h1>
        <p>Manage your enquiries and track their progress through our case management system.</p>
        <button mat-raised-button color="primary" (click)="createNewEnquiry()">
          <mat-icon>add</mat-icon>
          Create New Enquiry
        </button>
      </div>

      <div class="stats-section">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-number">{{ totalEnquiries }}</div>
            <div class="stat-label">Total Enquiries</div>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-number">{{ openEnquiries }}</div>
            <div class="stat-label">Open Enquiries</div>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-number">{{ inProgressEnquiries }}</div>
            <div class="stat-label">In Progress</div>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-number">{{ resolvedEnquiries }}</div>
            <div class="stat-label">Resolved</div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="recent-enquiries">
        <div class="section-header">
          <h2>Recent Enquiries</h2>
          <button mat-button (click)="viewAllEnquiries()">
            View All
            <mat-icon>arrow_forward</mat-icon>
          </button>
        </div>

        <div *ngIf="loading" class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Loading enquiries...</p>
        </div>

        <div *ngIf="!loading && recentEnquiries.length === 0" class="no-data">
          <mat-icon>inbox</mat-icon>
          <p>No enquiries found. Create your first enquiry to get started!</p>
        </div>

        <div *ngIf="!loading && recentEnquiries.length > 0" class="enquiries-grid">
          <mat-card *ngFor="let enquiry of recentEnquiries" class="enquiry-card" (click)="viewEnquiry(enquiry)">
            <mat-card-header>
              <mat-card-title>{{ enquiry.title }}</mat-card-title>
              <mat-card-subtitle>
                {{ enquiry.type }} • {{ enquiry.createdAt | date:'short' }}
              </mat-card-subtitle>
            </mat-card-header>
            
            <mat-card-content>
              <p class="enquiry-description">{{ enquiry.description | slice:0:100 }}{{ enquiry.description.length > 100 ? '...' : '' }}</p>
              
              <div class="enquiry-meta">
                <mat-chip-set>
                  <mat-chip [class]="getStatusClass(enquiry.status)">
                    {{ enquiry.status }}
                  </mat-chip>
                </mat-chip-set>
              </div>
            </mat-card-content>
            
            <mat-card-actions>
              <button mat-button (click)="viewEnquiry(enquiry); $event.stopPropagation()">
                <mat-icon>visibility</mat-icon>
                View Details
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .welcome-section {
      text-align: center;
      margin-bottom: 40px;
      padding: 40px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 12px;
    }

    .welcome-section h1 {
      font-size: 2.5rem;
      margin-bottom: 16px;
      font-weight: 300;
    }

    .welcome-section p {
      font-size: 1.1rem;
      margin-bottom: 24px;
      opacity: 0.9;
    }

    .stats-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .stat-card {
      text-align: center;
      transition: transform 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: bold;
      color: #1976d2;
      margin-bottom: 8px;
    }

    .stat-label {
      color: #666;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .section-header h2 {
      margin: 0;
      color: #333;
    }

    .loading-container {
      text-align: center;
      padding: 40px;
    }

    .loading-container p {
      margin-top: 16px;
      color: #666;
    }

    .no-data {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .no-data mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .enquiries-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }

    .enquiry-card {
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .enquiry-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .enquiry-description {
      color: #666;
      line-height: 1.5;
      margin: 12px 0;
    }

    .enquiry-meta {
      margin-top: 16px;
    }

    .status-open {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .status-in-progress {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .status-pending-review {
      background-color: #f3e5f5;
      color: #7b1fa2;
    }

    .status-resolved {
      background-color: #e8f5e8;
      color: #388e3c;
    }

    .status-closed {
      background-color: #f5f5f5;
      color: #666;
    }

    .status-cancelled {
      background-color: #ffebee;
      color: #d32f2f;
    }

  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  recentEnquiries: Enquiry[] = [];
  totalEnquiries = 0;
  openEnquiries = 0;
  inProgressEnquiries = 0;
  resolvedEnquiries = 0;
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private enquiryService: EnquiryService,
    private processService: ProcessService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadEnquiries();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadEnquiries(): void {
    this.loading = true;
    this.enquiryService.getEnquiries({ page: 0, size: 6, sort: 'createdAt,desc' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (enquiries) => {
          this.recentEnquiries = enquiries;
          this.calculateStats(enquiries);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading enquiries:', error);
          this.snackBar.open('Error loading enquiries', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  private calculateStats(enquiries: Enquiry[]): void {
    this.totalEnquiries = enquiries.length;
    this.openEnquiries = enquiries.filter(e => e.status === EnquiryStatus.OPEN).length;
    this.inProgressEnquiries = enquiries.filter(e => e.status === EnquiryStatus.IN_PROGRESS).length;
    this.resolvedEnquiries = enquiries.filter(e => e.status === EnquiryStatus.RESOLVED).length;
  }

  createNewEnquiry(): void {
    this.router.navigate(['/enquiries/new']);
  }

  viewAllEnquiries(): void {
    this.router.navigate(['/enquiries']);
  }

  viewEnquiry(enquiry: Enquiry): void {
    if (enquiry.id) {
      this.router.navigate(['/enquiries', enquiry.id]);
    }
  }

  getStatusClass(status: EnquiryStatus): string {
    return `status-${status.toLowerCase().replace('_', '-')}`;
  }

}