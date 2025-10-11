import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Observable, Subject, forkJoin, of } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';

import { ProcessService } from '../../../core/services/process.service';
import { ProcessInstance } from '../../../core/models/process.model';

interface ProcessActivity {
  id: string;
  name: string;
  type: string;
  status: string;
  startTime?: Date;
  endTime?: Date;
  assignee?: string;
}

interface ProcessNode {
  id: string;
  name: string;
  type: string;
  status: string;
  completed: boolean;
  active: boolean;
}

@Component({
  selector: 'app-process-visualization',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTabsModule
  ],
  template: `
    <div class="process-visualization">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>account_tree</mat-icon>
            Process Visualization
          </mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <div *ngIf="loading" class="loading-container">
            <mat-spinner diameter="40"></mat-spinner>
            <p>Loading process information...</p>
          </div>

          <div *ngIf="!loading" class="process-content">
            <mat-tab-group>
              <!-- SVG Visualization Tab -->
              <mat-tab label="Process Flow">
                <div class="svg-container">
                  <div *ngIf="safeProcessSvg" [innerHTML]="safeProcessSvg" class="process-svg"></div>
                  <div *ngIf="!safeProcessSvg" class="no-svg">
                    <mat-icon>image_not_supported</mat-icon>
                    <p>Process SVG not available</p>
                  </div>
                </div>
              </mat-tab>

              <!-- Process Activities Tab -->
              <mat-tab label="Activities">
                <div class="activities-container">
                  <div *ngIf="activities.length > 0; else noActivities">
                    <div *ngFor="let activity of activities" class="activity-item" [ngClass]="getActivityStatusClass(activity)">
                      <mat-icon class="activity-icon">{{ getActivityIcon(activity) }}</mat-icon>
                      <div class="activity-details">
                        <div class="activity-name">{{ activity.name }}</div>
                        <div class="activity-status">{{ activity.status }}</div>
                      </div>
                    </div>
                  </div>
                  <ng-template #noActivities>
                    <div class="no-activities">
                      <mat-icon>info</mat-icon>
                      <p>No activities found</p>
                    </div>
                  </ng-template>
                </div>
              </mat-tab>

              <!-- Process Variables Tab -->
              <mat-tab label="Variables">
                <div class="variables-container">
                  <div *ngIf="hasNoVariables(); else noVariables">
                    <div *ngFor="let variable of getVariableEntries()" class="variable-item">
                      <span class="variable-name">{{ variable.key }}:</span>
                      <span class="variable-value">{{ variable.value }}</span>
                    </div>
                  </div>
                  <ng-template #noVariables>
                    <div class="no-variables">
                      <mat-icon>info</mat-icon>
                      <p>No variables found</p>
                    </div>
                  </ng-template>
                </div>
              </mat-tab>

              <!-- Process History Tab -->
              <mat-tab label="History">
                <div class="history-container">
                  <div *ngIf="processHistory.length > 0; else noHistory">
                    <div *ngFor="let historyItem of processHistory" class="history-item">
                      <mat-icon class="history-icon">{{ getHistoryIcon(historyItem) }}</mat-icon>
                      <div class="history-details">
                        <div class="history-description">{{ historyItem.description || 'Process event' }}</div>
                        <div class="history-timestamp">{{ historyItem.timestamp | date:'medium' }}</div>
                      </div>
                    </div>
                  </div>
                  <ng-template #noHistory>
                    <div class="no-history">
                      <mat-icon>info</mat-icon>
                      <p>No history found</p>
                    </div>
                  </ng-template>
                </div>
              </mat-tab>
            </mat-tab-group>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrl: './process-visualization.component.css'
})
export class ProcessVisualizationComponent implements OnInit, OnDestroy {
  @Input() processInstanceId!: string;
  @Input() processInstance?: ProcessInstance;

  loading = true;
  processSvg: string | null = null;
  safeProcessSvg: SafeHtml | null = null;
  activities: ProcessActivity[] = [];
  processVariables: any = {};
  processHistory: any[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private processService: ProcessService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadProcessData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProcessData(): void {
    if (!this.processInstanceId) {
      this.loading = false;
      return;
    }


    forkJoin({
      svg: this.processService.getProcessSvg(this.processInstanceId).pipe(
        catchError((error) => {
          console.error('Error loading SVG:', error);
          return of(null);
        })
      ),
      activities: this.processService.getProcessActivities(this.processInstanceId).pipe(
        catchError((error) => {
          console.error('Error loading activities:', error);
          return of([]);
        })
      ),
      variables: this.processService.getProcessVariables(this.processInstanceId).pipe(
        catchError((error) => {
          console.error('Error loading variables:', error);
          return of({});
        })
      ),
      history: this.processService.getProcessHistory(this.processInstanceId).pipe(
        catchError((error) => {
          console.error('Error loading history:', error);
          return of([]);
        })
      )
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.processSvg = data.svg;
          if (data.svg) {
            this.safeProcessSvg = this.sanitizer.bypassSecurityTrustHtml(data.svg);
          }
          this.activities = data.activities;
          this.processVariables = data.variables;
          this.processHistory = data.history;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading process data:', error);
          this.loading = false;
        }
      });
  }

  getActivityIcon(activity: ProcessActivity): string {
    if (!activity.type) return 'help_outline';
    
    const type = activity.type.toLowerCase();
    if (type.includes('start')) return 'play_arrow';
    if (type.includes('end')) return 'stop';
    if (type.includes('task')) return 'assignment';
    if (type.includes('gateway')) return 'call_split';
    if (type.includes('event')) return 'event';
    if (type.includes('service')) return 'build';
    return 'help_outline';
  }

  getActivityStatusClass(activity: ProcessActivity): string {
    if (!activity.status) return 'status-unknown';
    
    const status = activity.status.toLowerCase();
    if (status.includes('completed') || status.includes('finished')) return 'completed';
    if (status.includes('active') || status.includes('running')) return 'active';
    if (status.includes('error') || status.includes('failed')) return 'error';
    return 'status-unknown';
  }

  getHistoryIcon(historyItem: any): string {
    if (historyItem.type) {
      const type = historyItem.type.toLowerCase();
      if (type.includes('start')) return 'play_arrow';
      if (type.includes('end')) return 'stop';
      if (type.includes('task')) return 'assignment';
      if (type.includes('gateway')) return 'call_split';
      if (type.includes('event')) return 'event';
      if (type.includes('service')) return 'build';
    }
    return 'history';
  }

  hasNoVariables(): boolean {
    return Object.keys(this.processVariables).length === 0;
  }

  getVariableEntries(): Array<{key: string, value: any}> {
    return Object.entries(this.processVariables).map(([key, value]) => ({
      key,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value)
    }));
  }
}