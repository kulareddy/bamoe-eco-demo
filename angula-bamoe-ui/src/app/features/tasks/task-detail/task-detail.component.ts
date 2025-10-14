import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { ProcessService } from '../../../core/services/process.service';
import { AuthService } from '../../../core/services/auth.service';
import { Task } from '../../../core/models/process.model';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  template: `
    <div class="task-detail-container" *ngIf="task">
      <!-- Header -->
      <div class="detail-header">
        <div class="header-info">
          <h1>{{ task.name }}</h1>
          <div class="header-meta">
            <mat-chip [class]="'status-chip ' + task.status.toLowerCase()">
              {{ task.status }}
            </mat-chip>
            <mat-chip [class]="getPriorityClass(task.priority)">
              {{ getPriorityLabel(task.priority) }}
            </mat-chip>
            <span class="created-info">Created {{ task.created | date }}</span>
          </div>
        </div>
        <div class="header-actions">
          <button mat-button routerLink="/tasks">
            <mat-icon>arrow_back</mat-icon>
            Back to Tasks
          </button>
        </div>
      </div>

      <!-- Task Information -->
      <mat-card class="info-card">
        <mat-card-header>
          <mat-card-title>Task Information</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="detail-field" *ngIf="task.description">
            <label>Description:</label>
            <p>{{ task.description }}</p>
          </div>
          <div class="detail-field">
            <label>Process Instance:</label>
            <p>{{ task.processInstanceId }}</p>
          </div>
          <div class="detail-field" *ngIf="task.assignee">
            <label>Assignee:</label>
            <p>{{ task.assignee }}</p>
          </div>
          <div class="detail-field" *ngIf="task.due">
            <label>Due Date:</label>
            <p [class]="getDueDateClass(task.due)">{{ task.due | date:'full' }}</p>
          </div>
          <div class="detail-field" *ngIf="task.candidateGroups && task.candidateGroups.length > 0">
            <label>Candidate Groups:</label>
            <div class="chip-list">
              <mat-chip *ngFor="let group of task.candidateGroups">{{ group }}</mat-chip>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Task Actions -->
      <mat-card class="actions-card">
        <mat-card-content>
          <div class="task-actions-row">
            <h3 class="task-actions-title">Task Actions</h3>
            <div class="task-actions-buttons">
              <button mat-raised-button 
                      color="primary" 
                      (click)="claimTask()" 
                      *ngIf="canClaim()">
                <mat-icon>assignment_ind</mat-icon>
                Claim Task
              </button>
              <button mat-raised-button 
                      color="warn" 
                      (click)="releaseTask()" 
                      *ngIf="canRelease()">
                <mat-icon>assignment_return</mat-icon>
                Release Task
              </button>
              <button mat-raised-button 
                      color="accent" 
                      (click)="completeTask()" 
                      *ngIf="canComplete() && taskForm"
                      [disabled]="completing">
                <mat-icon>check_circle</mat-icon>
                {{ completing ? 'Completing...' : 'Complete Task' }}
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Task Form -->
      <mat-card class="form-card" *ngIf="taskForm && canComplete()">
        <mat-card-header>
          <mat-card-title>Complete Task</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="taskForm" (ngSubmit)="completeTask()">
            <div *ngFor="let field of formFields" class="form-field">
              <mat-form-field class="full-width">
                <mat-label>{{ field.label }}</mat-label>
                <input matInput 
                       [formControlName]="field.name"
                       [type]="field.type || 'text'"
                       *ngIf="field.type !== 'select' && field.type !== 'textarea'">
                <textarea matInput 
                          [formControlName]="field.name"
                          rows="3"
                          *ngIf="field.type === 'textarea'"></textarea>
                <mat-select [formControlName]="field.name" *ngIf="field.type === 'select'">
                  <mat-option *ngFor="let option of field.options" [value]="option.value">
                    {{ option.label }}
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>
            
            <div class="form-actions">
              <!-- Complete Task button moved to Task Actions section -->
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Variables -->
      <mat-card class="variables-card" *ngIf="task.variables && hasVariables()">
        <mat-card-header>
          <mat-card-title>Task Variables</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div *ngFor="let variable of getVariableEntries()" class="variable-item">
            <strong>{{ variable.key }}:</strong>
            <span>{{ variable.value | json }}</span>
          </div>
        </mat-card-content>
      </mat-card>
    </div>

    <div *ngIf="!task && !loading" class="error-state">
      <mat-icon>error</mat-icon>
      <p>Task not found</p>
      <button mat-raised-button routerLink="/tasks">Back to Tasks</button>
    </div>
  `,
  styles: [`
    .task-detail-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      gap: 24px;
    }

    .header-info h1 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .header-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }

    .info-card, .actions-card, .form-card, .variables-card {
      margin-bottom: 24px;
    }

    .actions-card {
      background-color: #f8f9fa;
      border-left: 4px solid #3f51b5;
    }

    .task-actions-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .task-actions-title {
      margin: 0;
      color: #3f51b5;
      font-size: 18px;
      font-weight: 500;
      flex-shrink: 0;
    }

    .task-actions-buttons {
      display: flex;
      gap: 12px;
      flex-wrap: nowrap;
      align-items: center;
    }

    .task-actions-buttons button {
      min-width: 140px;
      flex-shrink: 0;
    }

    .task-actions-buttons button mat-icon {
      margin-right: 8px;
    }

    @media (max-width: 768px) {
      .task-actions-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
      
      .task-actions-buttons {
        flex-wrap: wrap;
        gap: 8px;
        width: 100%;
      }
      
      .task-actions-buttons button {
        min-width: 120px;
        flex: 1;
      }
    }

    .detail-field {
      margin-bottom: 16px;
    }

    .detail-field label {
      font-weight: 500;
      display: block;
      margin-bottom: 4px;
      color: #666;
    }

    .detail-field p {
      margin: 0;
      color: #333;
    }

    .chip-list {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .form-field {
      margin-bottom: 16px;
    }

    .form-actions {
      margin-top: 24px;
    }

    .variable-item {
      margin-bottom: 8px;
      padding: 8px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }

    .priority-chip {
      &.low { background-color: #e8f5e8; color: #2e7d32; }
      &.medium { background-color: #fff3e0; color: #ef6c00; }
      &.high { background-color: #ffebee; color: #c62828; }
      &.critical { background-color: #fce4ec; color: #ad1457; }
    }

    .due-soon {
      color: #f57c00;
      font-weight: 500;
    }

    .overdue {
      color: #d32f2f;
      font-weight: 500;
    }

    .created-info {
      color: #666;
      font-size: 14px;
    }

    .error-state {
      text-align: center;
      padding: 48px;
    }

    .full-width {
      width: 100%;
    }
  `]
})
export class TaskDetailComponent implements OnInit {
  task: Task | null = null;
  taskForm: FormGroup | null = null;
  formFields: any[] = [];
  loading = true;
  completing = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private processService: ProcessService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTask(id);
    }
  }

  loadTask(id: string): void {
    this.processService.getTaskById(id).subscribe({
      next: (task) => {
        this.task = task;
        this.loading = false;
        if (this.canComplete()) {
          this.loadTaskForm(id);
        }
      },
      error: (error) => {
        console.error('Error loading task:', error);
        this.loading = false;
      }
    });
  }

  loadTaskForm(taskId: string): void {
    this.processService.getTaskForm(taskId).subscribe({
      next: (formData) => {
        this.buildForm(formData);
      },
      error: (error) => {
        console.error('Error loading task form:', error);
        // Create a simple form for enquiry status update
        this.createSimpleForm();
      }
    });
  }

  buildForm(formData: any): void {
    if (formData && formData.fields) {
      this.formFields = formData.fields;
      const formControls: any = {};
      
      this.formFields.forEach(field => {
        formControls[field.name] = [field.defaultValue || ''];
      });
      
      this.taskForm = this.fb.group(formControls);
    } else {
      this.createSimpleForm();
    }
  }

  createSimpleForm(): void {
    this.formFields = [
      {
        name: 'status',
        label: 'Enquiry Status',
        type: 'select',
        options: [
          { value: 'IN_PROGRESS', label: 'In Progress' },
          { value: 'PENDING_REVIEW', label: 'Pending Review' },
          { value: 'RESOLVED', label: 'Resolved' },
          { value: 'CLOSED', label: 'Closed' }
        ]
      },
      {
        name: 'comment',
        label: 'Comment',
        type: 'textarea'
      }
    ];

    this.taskForm = this.fb.group({
      status: ['IN_PROGRESS'],
      comment: ['']
    });
  }

  canClaim(): boolean {
    return this.task ? !this.task.assignee && (
      this.task.candidateUsers?.includes(this.authService.getUsername()) ||
      this.task.candidateGroups?.some(group => this.authService.hasRole(group))
    ) || false : false;
  }

  canRelease(): boolean {
    return this.task?.assignee === this.authService.getUsername();
  }

  canComplete(): boolean {
    return this.task?.assignee === this.authService.getUsername();
  }

  claimTask(): void {
    if (this.task) {
      this.processService.claimTask(this.task.id).subscribe({
        next: () => {
          this.loadTask(this.task!.id);
        },
        error: (error) => {
          console.error('Error claiming task:', error);
        }
      });
    }
  }

  releaseTask(): void {
    if (this.task) {
      this.processService.releaseTask(this.task.id).subscribe({
        next: () => {
          this.loadTask(this.task!.id);
        },
        error: (error) => {
          console.error('Error releasing task:', error);
        }
      });
    }
  }

  completeTask(): void {
    if (this.task && this.taskForm) {
      this.completing = true;
      const formData = this.taskForm.value;
      
      this.processService.completeTask(this.task.id, formData).subscribe({
        next: () => {
          this.completing = false;
          this.router.navigate(['/tasks']);
        },
        error: (error) => {
          console.error('Error completing task:', error);
          this.completing = false;
        }
      });
    }
  }

  getPriorityClass(priority: number): string {
    if (priority >= 8) return 'priority-chip critical';
    if (priority >= 6) return 'priority-chip high';
    if (priority >= 4) return 'priority-chip medium';
    return 'priority-chip low';
  }

  getPriorityLabel(priority: number): string {
    if (priority >= 8) return 'Critical';
    if (priority >= 6) return 'High';
    if (priority >= 4) return 'Medium';
    return 'Low';
  }

  getDueDateClass(dueDate?: Date): string {
    if (!dueDate) return '';
    
    const now = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 2) return 'due-soon';
    return '';
  }

  hasVariables(): boolean {
    return this.task?.variables && Object.keys(this.task.variables).length > 0;
  }

  getVariableEntries(): { key: string, value: any }[] {
    if (!this.task?.variables) return [];
    return Object.entries(this.task.variables).map(([key, value]) => ({ key, value }));
  }
}