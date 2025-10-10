import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';

import { ProcessService } from '../../../core/services/process.service';
import { AuthService } from '../../../core/services/auth.service';
import { Task } from '../../../core/models/process.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    RouterModule
  ],
  template: `
    <div class="task-list-container">
      <div class="header">
        <h1>My Tasks</h1>
      </div>

      <mat-card class="table-card">
        <table mat-table [dataSource]="tasks" class="task-table">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Task Name</th>
            <td mat-cell *matCellDef="let task">
              <div class="task-name">{{ task.name }}</div>
              <div class="task-description">{{ task.description }}</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="processInstance">
            <th mat-header-cell *matHeaderCellDef>Process</th>
            <td mat-cell *matCellDef="let task">{{ task.processInstanceId }}</td>
          </ng-container>

          <ng-container matColumnDef="priority">
            <th mat-header-cell *matHeaderCellDef>Priority</th>
            <td mat-cell *matCellDef="let task">
              <mat-chip [class]="getPriorityClass(task.priority)">{{ getPriorityLabel(task.priority) }}</mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let task">
              <mat-chip [class]="'status-chip ' + task.status.toLowerCase()">{{ task.status }}</mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="created">
            <th mat-header-cell *matHeaderCellDef>Created</th>
            <td mat-cell *matCellDef="let task">{{ task.created | date:'short' }}</td>
          </ng-container>

          <ng-container matColumnDef="due">
            <th mat-header-cell *matHeaderCellDef>Due Date</th>
            <td mat-cell *matCellDef="let task">
              <span [class]="getDueDateClass(task.due)">
                {{ task.due ? (task.due | date:'short') : 'No due date' }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let task">
              <button mat-icon-button [routerLink]="['/tasks', task.id]" title="View Task">
                <mat-icon>visibility</mat-icon>
              </button>
              <button mat-icon-button 
                      (click)="claimTask(task)" 
                      *ngIf="canClaim(task)"
                      title="Claim Task">
                <mat-icon>assignment_ind</mat-icon>
              </button>
              <button mat-icon-button 
                      (click)="releaseTask(task)" 
                      *ngIf="canRelease(task)"
                      title="Release Task">
                <mat-icon>assignment_return</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
              class="task-row" 
              [routerLink]="['/tasks', row.id]"></tr>
        </table>

        <div *ngIf="tasks.length === 0" class="no-data">
          <mat-icon>task</mat-icon>
          <p>No tasks assigned to you</p>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .task-list-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      margin-bottom: 24px;
    }

    .header h1 {
      margin: 0;
      color: #333;
    }

    .table-card {
      overflow: auto;
    }

    .task-table {
      width: 100%;
    }

    .task-name {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .task-description {
      color: #666;
      font-size: 14px;
    }

    .task-row {
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .task-row:hover {
      background-color: #f5f5f5;
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

    .no-data {
      text-align: center;
      padding: 48px;
      color: #666;
    }

    .no-data mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }
  `]
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  loading = true;
  displayedColumns = ['name', 'processInstance', 'priority', 'status', 'created', 'due', 'actions'];

  constructor(
    private processService: ProcessService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    const username = this.authService.getUsername();
    
    this.processService.getAllTasks({ 
      assignee: username 
    }).subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.loading = false;
      }
    });
  }

  canClaim(task: Task): boolean {
    return !task.assignee && (
      task.candidateUsers?.includes(this.authService.getUsername()) ||
      task.candidateGroups?.some(group => this.authService.hasRole(group))
    ) || false;
  }

  canRelease(task: Task): boolean {
    return task.assignee === this.authService.getUsername();
  }

  claimTask(task: Task): void {
    this.processService.claimTask(task.id).subscribe({
      next: () => {
        this.loadTasks(); // Refresh the list
      },
      error: (error) => {
        console.error('Error claiming task:', error);
      }
    });
  }

  releaseTask(task: Task): void {
    this.processService.releaseTask(task.id).subscribe({
      next: () => {
        this.loadTasks(); // Refresh the list
      },
      error: (error) => {
        console.error('Error releasing task:', error);
      }
    });
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
}