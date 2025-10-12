import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';

import { EnquiryService } from '../../../core/services/enquiry.service';
import { ProcessService } from '../../../core/services/process.service';
import { AuthService } from '../../../core/services/auth.service';
import { Enquiry, EnquiryType } from '../../../core/models/enquiry.model';

@Component({
  selector: 'app-enquiry-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="enquiry-form-container">
      <mat-card class="form-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>add_circle</mat-icon>
            {{ isEditMode ? 'Edit Enquiry' : 'Create New Enquiry' }}
          </mat-card-title>
          <mat-card-subtitle>
            {{ isEditMode ? 'Update enquiry details' : 'Fill in the details to create a new enquiry' }}
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="enquiryForm" (ngSubmit)="onSubmit()" class="enquiry-form">
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Title *</mat-label>
                <input matInput formControlName="title" placeholder="Enter enquiry title">
                <mat-error *ngIf="enquiryForm.get('title')?.hasError('required')">
                  Title is required
                </mat-error>
                <mat-error *ngIf="enquiryForm.get('title')?.hasError('minlength')">
                  Title must be at least 3 characters
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description *</mat-label>
                <textarea matInput formControlName="description" 
                         placeholder="Describe your enquiry in detail" 
                         rows="4"></textarea>
                <mat-error *ngIf="enquiryForm.get('description')?.hasError('required')">
                  Description is required
                </mat-error>
                <mat-error *ngIf="enquiryForm.get('description')?.hasError('minlength')">
                  Description must be at least 10 characters
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Type *</mat-label>
                <mat-select formControlName="type">
                  <mat-option *ngFor="let type of enquiryTypes" [value]="type">
                    {{ type }}
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="enquiryForm.get('type')?.hasError('required')">
                  Type is required
                </mat-error>
              </mat-form-field>

            </div>

            <div class="form-actions">
              <button type="button" mat-button (click)="onCancel()" [disabled]="submitting">
                <mat-icon>cancel</mat-icon>
                Cancel
              </button>
              <button type="submit" mat-raised-button color="primary" [disabled]="enquiryForm.invalid || submitting">
                <mat-spinner *ngIf="submitting" diameter="20"></mat-spinner>
                <mat-icon *ngIf="!submitting">{{ isEditMode ? 'save' : 'add' }}</mat-icon>
                {{ submitting ? 'Processing...' : (isEditMode ? 'Update Enquiry' : 'Create Enquiry') }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .enquiry-form-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
    }

    .form-card {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .form-card mat-card-header {
      margin-bottom: 24px;
    }

    .form-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #1976d2;
    }

    .enquiry-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-row:first-child {
      grid-template-columns: 1fr;
    }

    .full-width {
      width: 100%;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e0e0e0;
    }

    .form-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 120px;
    }

    mat-form-field {
      width: 100%;
    }

    textarea {
      resize: vertical;
      min-height: 100px;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
      
      .form-actions {
        flex-direction: column;
      }
      
      .form-actions button {
        width: 100%;
      }
    }
  `]
})
export class EnquiryFormComponent implements OnInit, OnDestroy {
  enquiryForm: FormGroup;
  enquiryTypes = Object.values(EnquiryType);
  isEditMode = false;
  submitting = false;
  enquiryId?: string;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private enquiryService: EnquiryService,
    private processService: ProcessService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.enquiryForm = this.createForm();
  }

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['id']) {
          this.isEditMode = true;
          this.enquiryId = params['id'];
          this.loadEnquiry();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      type: ['', Validators.required]
    });
  }

  private loadEnquiry(): void {
    if (this.enquiryId) {
      this.enquiryService.getEnquiryById(this.enquiryId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (enquiry) => {
            this.enquiryForm.patchValue({
              title: enquiry.title,
              description: enquiry.description,
              type: enquiry.type
            });
          },
          error: (error) => {
            console.error('Error loading enquiry:', error);
            this.snackBar.open('Error loading enquiry', 'Close', { duration: 3000 });
            this.router.navigate(['/enquiries']);
          }
        });
    }
  }

  onSubmit(): void {
    if (this.enquiryForm.valid) {
      this.submitting = true;
      const formValue = this.enquiryForm.value;
      
      const enquiryData: Partial<Enquiry> = {
        title: formValue.title,
        description: formValue.description,
        type: formValue.type
      };

      if (this.isEditMode && this.enquiryId) {
        this.updateEnquiry(enquiryData);
      } else {
        this.createEnquiry(enquiryData);
      }
    }
  }

  private createEnquiry(enquiryData: Partial<Enquiry>): void {
    // Get current user from token
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.snackBar.open('User not authenticated', 'Close', { duration: 3000 });
      this.submitting = false;
      return;
    }

    // Map current user to backend User format (name, email, and userId)
    const reporterUser = {
      name: currentUser.name,
      email: currentUser.email,
      userId: currentUser.id || currentUser.userId
    };
    
    console.log('Current user from token:', currentUser);
    console.log('Reporter user being sent:', reporterUser);

    // Add current user as reporter
    const enquiryWithUser = {
      ...enquiryData,
      reporter: reporterUser
    };
    
    console.log('Creating enquiry with user:', currentUser);
    console.log('Mapped reporter user:', reporterUser);
    console.log('User Name:', currentUser.name);
    console.log('User Email:', currentUser.email);
    console.log('User ID:', currentUser.id);
    console.log('Enquiry data:', enquiryWithUser);
    
    // Validate that we have the required user information
    if (!currentUser.name || currentUser.name === 'Unknown User') {
      console.warn('User name is missing or unknown:', currentUser.name);
    }
    if (!currentUser.email) {
      console.warn('User email is missing:', currentUser.email);
    }

    // Create enquiry through BAMOE process (handles both enquiry creation and process initiation)
    this.processService.createEnquiry(enquiryWithUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (processInstance) => {
          this.snackBar.open('Enquiry created successfully!', 'Close', { duration: 3000 });
          // The process instance ID is the glue between Spring Boot and BAMOE
          // Navigate to enquiry detail - use process instance ID to fetch enquiry
          this.router.navigate(['/enquiries', processInstance.id]);
        },
        error: (error) => {
          console.error('Error creating enquiry:', error);
          this.snackBar.open('Error creating enquiry', 'Close', { duration: 3000 });
          this.submitting = false;
        }
      });
  }

  private updateEnquiry(enquiryData: Partial<Enquiry>): void {
    // Note: Enquiry updates should be handled through the process service
    // For now, we'll show a message that updates need to be done through the process
    this.snackBar.open('Enquiry updates are managed through the process workflow. Please use the enquiry detail page to add comments or change status.', 'Close', { duration: 5000 });
    this.submitting = false;
  }

  onCancel(): void {
    this.router.navigate(['/enquiries']);
  }
}