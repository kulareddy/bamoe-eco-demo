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
          
          // Process activities - with null check and date conversion
          this.activities = data?.activities?.map(activity => ({
            ...activity,
            startTime: activity.startTime ? new Date(activity.startTime) : undefined,
            endTime: activity.endTime ? new Date(activity.endTime) : undefined
          })) || [];
          
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
          this.activities = data.activities;
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
        email: currentUser.email   // From token: user1@example.com
      },
      commentedAt: new Date()
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