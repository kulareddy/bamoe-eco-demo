import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { ProcessService } from '../../../core/services/process.service';
import { AuthService } from '../../../core/services/auth.service';
import { Task } from '../../../core/models/process.model';

@Component({
  selector: 'app-task-work',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="task-work-container">
      <div class="header">
        <button mat-icon-button (click)="goBack()" class="back-btn">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Work on Task: {{ task?.name }}</h1>
      </div>

      <mat-card *ngIf="task" class="task-card">
        <mat-card-header>
          <mat-card-title>{{ task.name }}</mat-card-title>
          <mat-card-subtitle>
            Status: <span [class]="'status-' + task.status.toLowerCase()">{{ task.status }}</span>
            | Process: {{ task.processInstanceId }}
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <div *ngIf="task.description" class="task-description">
            <h3>Description</h3>
            <p>{{ task.description }}</p>
          </div>

          <div *ngIf="task.variables && task.variables['enquiry']" class="enquiry-info">
            <h3>Enquiry Information</h3>
            <div class="enquiry-details">
              <p><strong>Title:</strong> {{ task.variables['enquiry'].title }}</p>
              <p><strong>Description:</strong> {{ task.variables['enquiry'].description }}</p>
              <p><strong>Type:</strong> {{ task.variables['enquiry'].type }}</p>
              <p><strong>Status:</strong> {{ task.variables['enquiry'].status }}</p>
              <p><strong>Reporter:</strong> {{ task.variables['enquiry'].reporter?.name }} ({{ task.variables['enquiry'].reporter?.email }})</p>
            </div>
          </div>

          <!-- Task Actions -->
          <div class="task-actions" *ngIf="task">
            <h3>Task Actions</h3>
            <div class="action-buttons">
              <!-- Ready State: Show Claim button -->
              <button mat-raised-button 
                      color="primary"
                      (click)="claimTask()" 
                      *ngIf="isTaskReady()"
                      [disabled]="submitting"
                      title="Claim this task">
                <mat-icon>assignment_ind</mat-icon>
                Claim Task
              </button>
              
              <!-- Reserved State: Show Start button -->
              <button mat-raised-button 
                      color="accent"
                      (click)="startTask()" 
                      *ngIf="isTaskReserved()"
                      [disabled]="submitting"
                      title="Start working on this task">
                <mat-icon>play_arrow</mat-icon>
                Start Task
              </button>
              
              <!-- In Progress State: Show Complete button -->
              <button mat-raised-button 
                      color="primary"
                      (click)="completeTask()" 
                      *ngIf="isTaskInProgress()"
                      [disabled]="submitting"
                      title="Complete this task">
                <mat-icon>check_circle</mat-icon>
                Complete Task
              </button>
              
              <!-- Release button for reserved/in-progress tasks -->
              <button mat-button 
                      color="warn"
                      (click)="releaseTask()" 
                      *ngIf="canRelease()"
                      [disabled]="submitting"
                      title="Release this task">
                <mat-icon>assignment_return</mat-icon>
                Release Task
              </button>
            </div>
          </div>

          <!-- Task Form -->
          <form [formGroup]="taskForm" (ngSubmit)="submitTask()" class="task-form">
            <h3>Task Form</h3>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Resolution Notes</mat-label>
              <textarea matInput 
                        formControlName="resolutionNotes" 
                        placeholder="Enter resolution notes..."
                        rows="4">
              </textarea>
              <mat-hint>Describe how you resolved this enquiry</mat-hint>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Enquiry Status</mat-label>
              <mat-select formControlName="enquiryStatus">
                <mat-option value="RESOLVED">Resolved</mat-option>
                <mat-option value="CLOSED">Closed</mat-option>
                <mat-option value="CANCELLED">Cancelled</mat-option>
                <mat-option value="REOPENED">Reopened</mat-option>
              </mat-select>
            </mat-form-field>

            <div class="form-actions">
              <button mat-raised-button 
                      color="primary" 
                      type="submit" 
                      [disabled]="taskForm.invalid || submitting">
                <mat-icon>check_circle</mat-icon>
                Complete Task
              </button>
              
              <button mat-button 
                      type="button" 
                      (click)="goBack()"
                      [disabled]="submitting">
                Cancel
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <div *ngIf="loading" class="loading">
        <mat-spinner></mat-spinner>
        <p>Loading task...</p>
      </div>

      <div *ngIf="!task && !loading" class="no-task">
        <mat-icon>error</mat-icon>
        <p>Task not found</p>
      </div>
    </div>
  `,
  styles: [`
    .task-work-container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      align-items: center;
      margin-bottom: 24px;
      gap: 16px;
    }

    .header h1 {
      margin: 0;
      color: #333;
    }

    .back-btn {
      margin-right: 8px;
    }

    .task-card {
      margin-bottom: 24px;
    }

    .task-description,
    .enquiry-info {
      margin-bottom: 24px;
    }

    .enquiry-details p {
      margin: 8px 0;
    }

    .task-form {
      margin-top: 24px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .form-actions {
      display: flex;
      gap: 16px;
      margin-top: 24px;
    }

    .loading,
    .no-task {
      text-align: center;
      padding: 48px;
    }

    .loading mat-spinner {
      margin: 0 auto 16px;
    }

    .status-ready { color: #4caf50; }
    .status-reserved { color: #ff9800; }
    .status-in_progress { color: #2196f3; }
    .status-completed { color: #4caf50; }

    .task-actions {
      margin: 24px 0;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px;
      border-left: 4px solid #3f51b5;
    }

    .task-actions h3 {
      margin: 0 0 16px 0;
      color: #3f51b5;
      font-size: 16px;
      font-weight: 500;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .action-buttons button {
      min-width: 140px;
    }

    .action-buttons button mat-icon {
      margin-right: 8px;
      font-size: 18px;
    }
  `]
})
export class TaskWorkComponent implements OnInit {
  task: Task | null = null;
  loading = true;
  submitting = false;
  taskForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private processService: ProcessService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.taskForm = this.fb.group({
      resolutionNotes: ['', Validators.required],
      enquiryStatus: ['RESOLVED', Validators.required]
    });
  }

  ngOnInit(): void {
    const taskId = this.route.snapshot.paramMap.get('id');
    if (taskId) {
      this.loadTask(taskId);
    }
  }

  loadTask(taskId: string): void {
    this.loading = true;
    this.processService.getTaskById(taskId).subscribe({
      next: (task) => {
        this.task = task;
        
        // If we have a process instance ID and external reference ID, try to get more details from the process endpoint
        if (task.processInstanceId && task.externalReferenceId) {
          this.processService.getProcessTask(task.processInstanceId, task.externalReferenceId).subscribe({
            next: (processTask) => {
              // Merge process task data with existing task data
              this.task = { ...this.task, ...processTask };
              this.loading = false;
            },
            error: (error) => {
              console.warn('Could not load process task details, using basic task info:', error);
              this.loading = false;
            }
          });
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error loading task:', error);
        this.loading = false;
        this.snackBar.open('Error loading task', 'Close', { duration: 3000 });
      }
    });
  }

  submitTask(): void {
    if (this.taskForm.valid && this.task) {
      this.submitting = true;
      
      const formData = {
        resolutionNotes: this.taskForm.value.resolutionNotes,
        enquiryStatus: this.taskForm.value.enquiryStatus
      };

      // Use process-specific endpoint if we have process instance ID and external reference ID
      if (this.task.processInstanceId && this.task.externalReferenceId) {
        this.processService.completeProcessTask(this.task.processInstanceId, this.task.externalReferenceId, formData).subscribe({
          next: () => {
            this.snackBar.open('Task completed successfully', 'Close', { duration: 3000 });
            this.router.navigate(['/tasks']);
          },
          error: (error) => {
            console.error('Error completing task:', error);
            this.snackBar.open('Error completing task', 'Close', { duration: 3000 });
            this.submitting = false;
          }
        });
      } else {
        // Fallback to generic usertasks endpoint
        this.processService.completeTask(this.task.id, formData).subscribe({
          next: () => {
            this.snackBar.open('Task completed successfully', 'Close', { duration: 3000 });
            this.router.navigate(['/tasks']);
          },
          error: (error) => {
            console.error('Error completing task:', error);
            this.snackBar.open('Error completing task', 'Close', { duration: 3000 });
            this.submitting = false;
          }
        });
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/tasks']);
  }

  // Task State Checking Methods
  isTaskReady(): boolean {
    return this.task?.status === 'READY' && !this.task?.assignee;
  }

  isTaskReserved(): boolean {
    return this.task?.status === 'RESERVED' && this.task?.assignee === this.authService.getUsername();
  }

  isTaskInProgress(): boolean {
    return this.task?.status === 'IN_PROGRESS' && this.task?.assignee === this.authService.getUsername();
  }

  canRelease(): boolean {
    return this.task?.assignee === this.authService.getUsername() && 
           (this.task?.status === 'RESERVED' || this.task?.status === 'IN_PROGRESS');
  }

  // Task Action Methods
  claimTask(): void {
    this.submitting = true;
    if (this.task?.processInstanceId && this.task?.externalReferenceId) {
      // Use process-specific endpoint for claiming tasks
      this.processService.claimProcessTask(this.task.processInstanceId, this.task.externalReferenceId).subscribe({
        next: () => {
          this.snackBar.open('Task claimed successfully', 'Close', { duration: 3000 });
          this.loadTask(this.task!.id);
          this.submitting = false;
        },
        error: (error) => {
          console.error('Error claiming task:', error);
          this.snackBar.open('Error claiming task', 'Close', { duration: 3000 });
          this.submitting = false;
        }
      });
    } else {
      // Fallback to generic usertasks endpoint
      this.processService.claimTask(this.task!.id).subscribe({
        next: () => {
          this.snackBar.open('Task claimed successfully', 'Close', { duration: 3000 });
          this.loadTask(this.task!.id);
          this.submitting = false;
        },
        error: (error) => {
          console.error('Error claiming task:', error);
          this.snackBar.open('Error claiming task', 'Close', { duration: 3000 });
          this.submitting = false;
        }
      });
    }
  }

  startTask(): void {
    this.submitting = true;
    // Start task is essentially the same as claiming for reserved tasks
    this.processService.claimTask(this.task!.id).subscribe({
      next: () => {
        this.snackBar.open('Task started successfully', 'Close', { duration: 3000 });
        this.loadTask(this.task!.id);
        this.submitting = false;
      },
      error: (error) => {
        console.error('Error starting task:', error);
        this.snackBar.open('Error starting task', 'Close', { duration: 3000 });
        this.submitting = false;
      }
    });
  }

  completeTask(): void {
    // This will show the form for completion
    this.taskForm.get('resolutionNotes')?.setValue('');
    this.taskForm.get('enquiryStatus')?.setValue('RESOLVED');
  }

  releaseTask(): void {
    this.submitting = true;
    this.processService.releaseTask(this.task!.id).subscribe({
      next: () => {
        this.snackBar.open('Task released successfully', 'Close', { duration: 3000 });
        this.loadTask(this.task!.id);
        this.submitting = false;
      },
      error: (error) => {
        console.error('Error releasing task:', error);
        this.snackBar.open('Error releasing task', 'Close', { duration: 3000 });
        this.submitting = false;
      }
    });
  }
}
