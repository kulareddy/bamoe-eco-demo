import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { Subject, takeUntil } from 'rxjs';

import { EnquiryService } from '../../../core/services/enquiry.service';
import { ProcessService } from '../../../core/services/process.service';
import { AuthService } from '../../../core/services/auth.service';
import { Enquiry, EnquiryStatus } from '../../../core/models/enquiry.model';
import { ProcessInstance, Task } from '../../../core/models/process.model';
import { ProcessVisualizationComponent } from '../../../shared/components/process-visualization/process-visualization.component';

@Component({
  selector: 'app-enquiry-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    MatListModule,
    ProcessVisualizationComponent
  ],
  template: `
    <div class="enquiry-detail-container">
      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading enquiry details...</p>
      </div>

      <div *ngIf="!loading && enquiry" class="enquiry-content">
        <!-- Header -->
        <div class="enquiry-header">
          <div class="header-actions">
            <button mat-button (click)="goBack()">
              <mat-icon>arrow_back</mat-icon>
              Back
            </button>
            <button mat-raised-button color="primary" (click)="editEnquiry()">
              <mat-icon>edit</mat-icon>
              Edit
            </button>
            
            <!-- State Management Actions -->
            <button mat-button 
                    color="warn" 
                    (click)="cancelEnquiry()" 
                    *ngIf="canCancelEnquiry()">
              <mat-icon>cancel</mat-icon>
              Cancel
            </button>
            
            <button mat-button 
                    color="accent" 
                    (click)="reopenEnquiry()" 
                    *ngIf="canReopenEnquiry()">
              <mat-icon>refresh</mat-icon>
              Reopen
            </button>
            
            <button mat-button 
                    color="primary" 
                    (click)="closeEnquiry()" 
                    *ngIf="canCloseEnquiry()">
              <mat-icon>check_circle</mat-icon>
              Close
            </button>
          </div>
        </div>

        <!-- Main Content -->
        <div class="enquiry-main">
          <mat-card class="enquiry-info-card">
            <mat-card-header>
              <mat-card-title>{{ enquiry.title }}</mat-card-title>
              <mat-card-subtitle>
                <mat-chip [class]="getStatusClass(enquiry.status)">
                  {{ enquiry.status }}
                </mat-chip>
                <span class="enquiry-type">{{ enquiry.type }}</span>
              </mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <div class="enquiry-description">
                <h3>Description</h3>
                <p>{{ enquiry.description }}</p>
              </div>

              <mat-divider></mat-divider>

              <div class="enquiry-meta">
                <div class="meta-item">
                  <mat-icon>person</mat-icon>
                  <div>
                    <strong>Reported by:</strong>
                    <span>{{ enquiry.reporter?.name || 'Unknown' }}</span>
                  </div>
                </div>
                <div class="meta-item">
                  <mat-icon>schedule</mat-icon>
                  <div>
                    <strong>Created:</strong>
                    <span>{{ enquiry.createdAt | date:'medium' }}</span>
                  </div>
                </div>
                <div class="meta-item" *ngIf="enquiry.assignedTo">
                  <mat-icon>assignment_ind</mat-icon>
                  <div>
                    <strong>Assigned to:</strong>
                    <span>{{ enquiry.assignedTo.name }}</span>
                  </div>
                </div>
                <div class="meta-item" *ngIf="enquiry.updatedAt">
                  <mat-icon>update</mat-icon>
                  <div>
                    <strong>Last updated:</strong>
                    <span>{{ enquiry.updatedAt | date:'medium' }}</span>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Process Visualization -->
          <app-process-visualization 
            *ngIf="processInstance" 
            [processInstanceId]="processInstance.id"
            [processInstance]="processInstance">
          </app-process-visualization>

          <!-- Tasks -->
          <mat-card *ngIf="tasks.length > 0" class="tasks-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>assignment</mat-icon>
                Tasks
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <mat-list>
                <mat-list-item *ngFor="let task of tasks" class="task-item">
                  <mat-icon matListItemIcon>task</mat-icon>
                  <div matListItemTitle>{{ task.name }}</div>
                  <div matListItemLine>{{ task.description }}</div>
                  <div matListItemMeta>
                    <mat-chip [class]="getTaskStatusClass(task.status)">
                      {{ task.status }}
                    </mat-chip>
                  </div>
                </mat-list-item>
              </mat-list>
            </mat-card-content>
          </mat-card>

        </div>
      </div>

      <div *ngIf="!loading && !enquiry" class="error-container">
        <mat-icon>error</mat-icon>
        <h3>Enquiry not found</h3>
        <p>The enquiry you're looking for doesn't exist or you don't have permission to view it.</p>
        <button mat-raised-button color="primary" (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          Go Back
        </button>
      </div>
    </div>
  `,
  styles: [`
    .enquiry-detail-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 24px;
    }

    .loading-container {
      text-align: center;
      padding: 60px 20px;
    }

    .loading-container p {
      margin-top: 16px;
      color: #666;
    }

    .enquiry-header {
      margin-bottom: 24px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .enquiry-main {
      display: grid;
      gap: 24px;
    }

    .enquiry-info-card mat-card-subtitle {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 8px;
    }

    .enquiry-type {
      color: #666;
      font-size: 14px;
    }

    .enquiry-description {
      margin-bottom: 24px;
    }

    .enquiry-description h3 {
      margin-bottom: 12px;
      color: #333;
    }

    .enquiry-description p {
      line-height: 1.6;
      color: #666;
    }

    .enquiry-meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-top: 24px;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .meta-item mat-icon {
      color: #1976d2;
    }

    .meta-item div {
      display: flex;
      flex-direction: column;
    }

    .meta-item strong {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .process-info {
      display: grid;
      gap: 12px;
    }

    .process-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }

    .task-item {
      border-bottom: 1px solid #e0e0e0;
    }

    .task-item:last-child {
      border-bottom: none;
    }


    .error-container {
      text-align: center;
      padding: 60px 20px;
    }

    .error-container mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #d32f2f;
      margin-bottom: 16px;
    }

    .error-container h3 {
      color: #333;
      margin-bottom: 12px;
    }

    .error-container p {
      color: #666;
      margin-bottom: 24px;
    }

    /* Status Classes */
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


    .process-active {
      background-color: #e8f5e8;
      color: #388e3c;
    }

    .process-completed {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .process-suspended {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .process-aborted {
      background-color: #ffebee;
      color: #d32f2f;
    }

    .task-created, .task-ready {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .task-reserved, .task-in-progress {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .task-completed {
      background-color: #e8f5e8;
      color: #388e3c;
    }

    .task-failed, .task-error {
      background-color: #ffebee;
      color: #d32f2f;
    }

    .process-unknown {
      background-color: #f5f5f5;
      color: #666;
    }

    .task-unknown {
      background-color: #f5f5f5;
      color: #666;
    }
  `]
})
export class EnquiryDetailComponent implements OnInit, OnDestroy {
  enquiry: Enquiry | null = null;
  processInstance: ProcessInstance | null = null;
  tasks: Task[] = [];
  loading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private enquiryService: EnquiryService,
    private processService: ProcessService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['id']) {
          this.loadEnquiry(params['id']);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadEnquiry(id: string): void {
    this.loading = true;
    // First try to get enquiry by ID (UUID)
    this.enquiryService.getEnquiryById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (enquiry) => {
          console.log('Enquiry received:', enquiry);
          console.log('Reporter:', enquiry.reporter);
          console.log('Reporter Name:', enquiry.reporter?.name);
          console.log('Reporter ID:', enquiry.reporter?.id);
          console.log('Reporter Email:', enquiry.reporter?.email);
          
          // Check if user information is properly populated
          if (!enquiry.reporter?.name) {
            console.warn('No reporter name found in enquiry:', enquiry);
          }
          this.enquiry = enquiry;
          this.loadProcessInfo(id);
        },
        error: (error) => {
          console.log('Enquiry not found by ID, trying process instance ID:', id);
          // If not found by ID, try by process instance ID
          this.enquiryService.getEnquiryByProcessInstanceId(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (enquiry) => {
                this.enquiry = enquiry;
                this.loadProcessInfo(id);
              },
              error: (processError) => {
                console.error('Error loading enquiry:', processError);
                this.snackBar.open('Error loading enquiry', 'Close', { duration: 3000 });
                this.loading = false;
              }
            });
        }
      });
  }

  private loadProcessInfo(enquiryId: string): void {
    // Use the process instance ID directly from the enquiry object
    if (this.enquiry?.processInstanceId) {
      this.processService.getProcessById(this.enquiry.processInstanceId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (process) => {
            this.processInstance = process;
            this.loadTasks(process.id);
            this.loading = false;
          },
          error: (error) => {
            console.error('Error loading process info:', error);
            this.loading = false;
          }
        });
    } else {
      // Fallback: try to find process by enquiry ID in variables
      this.processService.getAllProcesses()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (processes) => {
            const process = processes.find(p => p.variables?.['enquiryId'] === enquiryId);
            if (process) {
              this.processInstance = process;
              this.loadTasks(process.id);
            }
            this.loading = false;
          },
          error: (error) => {
            console.error('Error loading process info:', error);
            this.loading = false;
          }
        });
    }
  }

  private loadTasks(processId: string): void {
    this.processService.getProcessTasks(processId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tasks) => {
          this.tasks = tasks;
        },
        error: (error) => {
          console.error('Error loading tasks:', error);
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/enquiries']);
  }

  editEnquiry(): void {
    if (this.enquiry?.id) {
      this.router.navigate(['/enquiries', this.enquiry.id, 'edit']);
    }
  }

  getStatusClass(status: EnquiryStatus): string {
    return `status-${status.toLowerCase().replace('_', '-')}`;
  }


  getProcessStatusClass(status: string): string {
    if (!status) return 'process-unknown';
    return `process-${status.toLowerCase()}`;
  }

  getTaskStatusClass(status: string): string {
    if (!status) return 'task-unknown';
    return `task-${status.toLowerCase().replace('_', '-')}`;
  }

  // State Management Operations (via BAMOE Process Service)
  cancelEnquiry(): void {
    const processId = this.enquiry?.processInstanceId || this.processInstance?.id;
    if (processId) {
      this.processService.cancelEnquiry(processId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('Enquiry cancelled successfully!', 'Close', { duration: 3000 });
            this.loadEnquiry(this.enquiry!.id!);
          },
          error: (error) => {
            console.error('Error cancelling enquiry:', error);
            this.snackBar.open('Error cancelling enquiry', 'Close', { duration: 3000 });
          }
        });
    }
  }

  reopenEnquiry(): void {
    const processId = this.enquiry?.processInstanceId || this.processInstance?.id;
    if (processId) {
      this.processService.reopenEnquiry(processId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('Enquiry reopened successfully!', 'Close', { duration: 3000 });
            this.loadEnquiry(this.enquiry!.id!);
          },
          error: (error) => {
            console.error('Error reopening enquiry:', error);
            this.snackBar.open('Error reopening enquiry', 'Close', { duration: 3000 });
          }
        });
    }
  }

  closeEnquiry(): void {
    const processId = this.enquiry?.processInstanceId || this.processInstance?.id;
    if (processId) {
      this.processService.closeEnquiry(processId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('Enquiry closed successfully!', 'Close', { duration: 3000 });
            this.loadEnquiry(this.enquiry!.id!);
          },
          error: (error) => {
            console.error('Error closing enquiry:', error);
            this.snackBar.open('Error closing enquiry', 'Close', { duration: 3000 });
          }
        });
    }
  }

  canCancelEnquiry(): boolean {
    return this.enquiry?.status === EnquiryStatus.OPEN || 
           this.enquiry?.status === EnquiryStatus.IN_PROGRESS;
  }

  canReopenEnquiry(): boolean {
    return this.enquiry?.status === EnquiryStatus.CANCELLED || 
           this.enquiry?.status === EnquiryStatus.CLOSED;
  }

  canCloseEnquiry(): boolean {
    return this.enquiry?.status === EnquiryStatus.RESOLVED;
  }

}