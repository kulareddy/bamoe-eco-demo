import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Observable, Subject, forkJoin, of } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';

import { ProcessService } from '../../../core/services/process.service';
import { GraphQLService, ProcessVisualizationData } from '../../../core/services/graphql.service';
import { ProcessInstance } from '../../../core/models/process.model';
import { Comment } from '../../../core/models/enquiry.model';
import { AuthService } from '../../../core/services/auth.service';

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
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatDividerModule,
    MatSnackBarModule,
    FormsModule
  ],
  styles: [`
    .activity-assignment {
      margin-top: 8px;
      font-size: 0.875rem;
    }
    
    .assignment-info {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #666;
    }
    
    .assignment-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    
    .assignment-text {
      font-size: 0.8rem;
    }
  `],
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
                        <!-- Show group/user info for Task Support activities -->
                        <div *ngIf="isTaskSupportActivity(activity)" class="activity-assignment">
                          <span *ngIf="activity.status === 'Ready'" class="assignment-info">
                            <mat-icon class="assignment-icon">group</mat-icon>
                            <span class="assignment-text">Available to: Tech Support Group</span>
                          </span>
                          <span *ngIf="activity.status === 'Reserved' && activity.assignee" class="assignment-info">
                            <mat-icon class="assignment-icon">person</mat-icon>
                            <span class="assignment-text">Assigned to: {{ activity.assignee }}</span>
                          </span>
                        </div>
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

              <!-- Comments Tab -->
              <mat-tab label="Comments">
                <div class="comments-container">
                  <!-- Add Comment Form -->
                  <div class="add-comment-section">
                    <mat-form-field appearance="outline" class="comment-input">
                      <mat-label>Add a comment</mat-label>
                      <textarea 
                        matInput 
                        [(ngModel)]="newComment" 
                        placeholder="Enter your comment..."
                        rows="3"
                        maxlength="2000"
                        [disabled]="addingComment">
                      </textarea>
                      <mat-hint>{{ newComment.length }}/2000 characters</mat-hint>
                    </mat-form-field>
                    <div class="comment-actions">
                      <button 
                        mat-raised-button 
                        color="primary" 
                        (click)="addComment()"
                        [disabled]="!newComment.trim() || addingComment">
                        <mat-icon *ngIf="addingComment">hourglass_empty</mat-icon>
                        <mat-icon *ngIf="!addingComment">add_comment</mat-icon>
                        {{ addingComment ? 'Adding...' : 'Add Comment' }}
                      </button>
                    </div>
                  </div>

                  <mat-divider></mat-divider>

                  <!-- Comments List -->
                  <div class="comments-list">
                    <div *ngIf="comments.length > 0; else noComments">
                      <div *ngFor="let comment of comments" class="comment-item">
                        <div class="comment-header">
                          <mat-icon class="comment-icon">comment</mat-icon>
                          <div class="comment-author">
                            <strong>{{ comment.commentedBy.name || 'Unknown User' }}</strong>
                            <span class="comment-date">{{ comment.commentedAt | date:'medium' }}</span>
                          </div>
                        </div>
                        <div class="comment-content">{{ comment.comment }}</div>
                      </div>
                    </div>
                    <ng-template #noComments>
                      <div class="no-comments">
                        <mat-icon>comment</mat-icon>
                        <p>No comments yet. Be the first to add a comment!</p>
                      </div>
                    </ng-template>
                  </div>
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
  comments: Comment[] = [];
  newComment: string = '';
  addingComment = false;

  private destroy$ = new Subject<void>();

  constructor(
    private processService: ProcessService,
    private graphqlService: GraphQLService,
    private authService: AuthService,
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

    // Check if GraphQL is available first
    this.graphqlService.isGraphQLAvailable()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (isAvailable) => {
          if (isAvailable) {
            console.log('GraphQL is available, using BAMOE GraphQL API');
            this.loadProcessDataViaGraphQL();
          } else {
            console.log('GraphQL not available, using REST API');
            this.loadProcessDataViaRest();
          }
          // Load comments regardless of GraphQL/REST choice
          this.loadComments();
        },
        error: (error) => {
          console.error('Error checking GraphQL availability:', error);
          // Fallback to REST API if GraphQL check fails
          this.loadProcessDataViaRest();
          this.loadComments();
        }
      });
  }

  private exploreGraphQLSchema(): void {
    // Method to explore BAMOE GraphQL schema for future implementation
    this.graphqlService.getSchema()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (schema) => {
          console.log('BAMOE GraphQL Schema:', schema);
          if (schema?.__schema?.queryType?.fields) {
            console.log('Available Query Fields:', schema.__schema.queryType.fields.map((f: any) => f.name));
          }
          if (schema?.__schema?.types) {
            const processTypes = schema.__schema.types.filter((t: any) => 
              t.name && (t.name.toLowerCase().includes('process') || t.name.toLowerCase().includes('task'))
            );
            console.log('Process-related Types:', processTypes.map((t: any) => t.name));
          }
        },
        error: (error) => {
          console.error('Error exploring GraphQL schema:', error);
        }
      });
  }

  private loadProcessDataViaGraphQL(): void {
    // Use GraphQL to get all process data in a single request
    this.graphqlService.getProcessVisualizationData(this.processInstanceId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: ProcessVisualizationData) => {
          console.log('GraphQL Response:', data);
          
          // Process SVG - with null check
          this.processSvg = data?.svg || null;
          if (this.processSvg) {
            this.safeProcessSvg = this.sanitizer.bypassSecurityTrustHtml(this.processSvg);
          }
          
          // Process activities - with null check and date conversion, filtered to exclude unwanted types
          this.activities = this.filterActivities(data?.activities?.map(activity => ({
            ...activity,
            startTime: activity.startTime ? new Date(activity.startTime) : undefined,
            endTime: activity.endTime ? new Date(activity.endTime) : undefined
          })) || []);
          
          // Process history - with null check and date conversion
          this.processHistory = data?.history?.map(historyItem => ({
            ...historyItem,
            timestamp: new Date(historyItem.timestamp)
          })) || [];
          
          // Process variables from process instance - with null check
          this.processVariables = data?.processInstance?.variables || {};
          
          console.log('Process Variables from GraphQL:', this.processVariables);
          console.log('Process Variables keys:', Object.keys(this.processVariables));
          
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading process data via GraphQL:', error);
          // Fallback to REST API if GraphQL fails
          this.loadProcessDataViaRest();
        }
      });
  }

  private loadProcessDataViaRest(): void {
    // Fallback to REST API if GraphQL is not available
    forkJoin({
      svg: this.processService.getProcessSvg(this.processInstanceId).pipe(
        catchError((error) => {
          console.error('Error loading SVG:', error);
          return of(null);
        })
      ),
      processInfo: this.processService.getProcessInfo(this.processInstanceId).pipe(
        catchError((error) => {
          console.error('Error loading process info:', error);
          return of(null);
        })
      ),
      activities: this.processService.getProcessActivities(this.processInstanceId).pipe(
        catchError((error) => {
          console.error('Error loading activities:', error);
          return of([]);
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
          this.activities = this.filterActivities(data.activities);
          this.processHistory = data.history;
          
          // Use variables from process info API call
          if (data.processInfo && data.processInfo.variables) {
            this.processVariables = data.processInfo.variables;
          } else if (this.processInstance && this.processInstance.variables) {
            this.processVariables = this.processInstance.variables;
          } else {
            this.processVariables = {};
          }
          
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading process data via REST:', error);
          this.loading = false;
        }
      });
  }

  getActivityIcon(activity: ProcessActivity): string {
    if (!activity.type) return 'help_outline';
    
    const type = activity.type.toLowerCase();
    const name = activity.name?.toLowerCase() || '';
    
    // Print Exit Task - use trace icon
    if (name.includes('print exit task') || name.includes('print exit')) {
      return 'track_changes';
    }
    
    // Service Enquiry Reopen - use same icon as Service Task Create Enquiry
    if (name.includes('service enquiry reopen') || name.includes('enquiry reopen')) {
      return 'settings_applications';
    }
    
    // Service tasks - use system/settings icon
    if (type.includes('service') || type.includes('servicetask') || name.includes('service task')) {
      return 'settings_applications';
    }
    
    // User tasks - use assignment icon
    if (type.includes('usertask') || type.includes('humantask') || type.includes('task') && !name.includes('service')) {
      return 'assignment';
    }
    
    // Business rule tasks - use rule icon
    if (type.includes('businessrule') || type.includes('ruleset') || name.includes('validate')) {
      return 'rule';
    }
    
    // Script tasks - use code icon
    if (type.includes('script') || name.includes('script')) {
      return 'code';
    }
    
    // Start events
    if (type.includes('start')) return 'play_arrow';
    
    // End events
    if (type.includes('end')) return 'stop';
    
    // Gateways
    if (type.includes('gateway')) return 'call_split';
    
    // Events
    if (type.includes('event')) return 'event';
    
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

  /**
   * Filter out unwanted activity types from the activities list
   * Ignores: start events, end events, link events, end signal events, milestones, sub process activities, and CE signals
   * Keeps: Service activities (Service Task Create Enquiry, Service Enquiry Reopen, etc.)
   */
  private filterActivities(activities: ProcessActivity[]): ProcessActivity[] {
    if (!activities || activities.length === 0) return [];
    
    return activities.filter(activity => {
      if (!activity.type) return true; // Keep activities without type info
      
      const type = activity.type.toLowerCase();
      const name = activity.name?.toLowerCase() || '';
      
      // Keep Service activities
      if (name.includes('service') || type.includes('service')) return true;
      
      // Filter out unwanted activity types
      if (type.includes('start') || type.includes('startevent')) return false;
      if (type.includes('end') || type.includes('endevent')) return false;
      if (type.includes('link')) return false;
      if (type.includes('signal') && (type.includes('end') || name.includes('end'))) return false;
      if (type.includes('milestone')) return false;
      
      // Filter out anything that starts with "Sub" (but keep Service activities)
      if (name.startsWith('sub') && !name.includes('service')) return false;
      
      // Filter out CE (signal) but keep Service activities
      if ((name.includes('ce') || type.includes('ce')) && !name.includes('service')) return false;
      
      // Filter out activities with names "Tasks" or "TaskSupport" (section titles)
      if (name === 'tasks' || name === 'tasksupport') return false;
      
      // Filter out activities with "Split" in the name
      if (name.includes('split')) return false;
      
      return true;
    });
  }

  /**
   * Check if an activity is a Task Support activity
   */
  isTaskSupportActivity(activity: ProcessActivity): boolean {
    const name = activity.name?.toLowerCase() || '';
    return name.includes('task support') || name.includes('tasksupport');
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


  /**
   * Load comments for the process instance
   */
  loadComments(): void {
    if (!this.processInstanceId) return;

    this.processService.getProcessComments(this.processInstanceId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (comments) => {
          this.comments = comments || [];
          console.log('Loaded comments:', this.comments);
        },
        error: (error) => {
          console.error('Error loading comments:', error);
          this.comments = [];
        }
      });
  }

  /**
   * Add a new comment
   */
  addComment(): void {
    if (!this.newComment.trim() || this.addingComment) return;

    this.addingComment = true;
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      console.error('No user information available from token');
      this.addingComment = false;
      return;
    }
    
    // User information comes from the token (user1, user1@example.com)
    const comment: Comment = {
      comment: this.newComment.trim(),
      commentedBy: {
        name: currentUser.name,    // From token: user1
        email: currentUser.email,  // From token: user1@example.com
        userId: currentUser.id || currentUser.userId
      }
      // commentedAt will be set by the backend
    };

    this.processService.addProcessComment(this.processInstanceId, comment)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (addedComment) => {
          this.comments.unshift(addedComment);
          this.newComment = '';
          this.addingComment = false;
          console.log('Comment added successfully:', addedComment);
        },
        error: (error) => {
          console.error('Error adding comment:', error);
          this.addingComment = false;
        }
      });
  }
}