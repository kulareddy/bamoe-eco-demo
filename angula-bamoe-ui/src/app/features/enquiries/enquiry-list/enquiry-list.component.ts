import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { EnquiryService } from '../../../core/services/enquiry.service';
import { Enquiry, EnquiryStatus, EnquiryType } from '../../../core/models/enquiry.model';

@Component({
  selector: 'app-enquiry-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatCardModule,
    MatProgressSpinnerModule,
    RouterModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="enquiry-list-container">
      <div class="header">
        <h1>Enquiries</h1>
        <button mat-raised-button color="primary" routerLink="/enquiries/create">
          <mat-icon>add</mat-icon>
          Create Enquiry
        </button>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <mat-card-content>
          <form [formGroup]="filterForm" class="filters-form">
            <mat-form-field>
              <mat-label>Status</mat-label>
              <mat-select formControlName="status" multiple>
                <mat-option *ngFor="let status of statusOptions" [value]="status">
                  {{ status }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Type</mat-label>
              <mat-select formControlName="type" multiple>
                <mat-option *ngFor="let type of typeOptions" [value]="type">
                  {{ type }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Search</mat-label>
              <input matInput formControlName="search" placeholder="Search title or description">
            </mat-form-field>

            <div class="filter-actions">
              <button mat-button (click)="clearFilters()">Clear</button>
              <button mat-raised-button color="primary" (click)="applyFilters()">Apply</button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Table -->
      <mat-card class="table-card">
        <div *ngIf="loading" class="loading-container">
          <mat-spinner></mat-spinner>
        </div>

        <table mat-table [dataSource]="enquiries" *ngIf="!loading" class="enquiry-table">
          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef>Title</th>
            <td mat-cell *matCellDef="let enquiry">
              <div class="enquiry-title">{{ enquiry.title }}</div>
              <div class="enquiry-description">{{ enquiry.description | slice:0:100 }}...</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef>Type</th>
            <td mat-cell *matCellDef="let enquiry">
              <mat-chip class="type-chip">{{ enquiry.type }}</mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let enquiry">
              <mat-chip [class]="getStatusClass(enquiry.status)">
                {{ enquiry.status }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="createdBy">
            <th mat-header-cell *matHeaderCellDef>Reported By</th>
            <td mat-cell *matCellDef="let enquiry">{{ enquiry.reporter?.name || 'Unknown' }}</td>
          </ng-container>

          <ng-container matColumnDef="createdAt">
            <th mat-header-cell *matHeaderCellDef>Created</th>
            <td mat-cell *matCellDef="let enquiry">{{ enquiry.createdAt | date:'short' }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let enquiry">
              <button mat-icon-button [routerLink]="['/enquiries', enquiry.id]">
                <mat-icon>visibility</mat-icon>
              </button>
              <button mat-icon-button [routerLink]="['/enquiries', enquiry.id, 'edit']">
                <mat-icon>edit</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
              class="enquiry-row" 
              [routerLink]="['/enquiries', row.id]"></tr>
        </table>

        <div *ngIf="!loading && enquiries.length === 0" class="no-data">
          <mat-icon>inbox</mat-icon>
          <p>No enquiries found</p>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .enquiry-list-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header h1 {
      margin: 0;
      color: #333;
    }

    .header button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .filters-card {
      margin-bottom: 24px;
    }

    .filters-form {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      align-items: end;
    }

    .filter-actions {
      display: flex;
      gap: 8px;
    }

    .table-card {
      overflow: auto;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }

    .enquiry-table {
      width: 100%;
    }

    .enquiry-title {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .enquiry-description {
      color: #666;
      font-size: 14px;
    }

    .enquiry-row {
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .enquiry-row:hover {
      background-color: #f5f5f5;
    }

    .type-chip {
      background-color: #e1f5fe;
      color: #01579b;
    }

    .status-chip {
      font-weight: 500;
      text-transform: uppercase;
      font-size: 12px;
    }

    .status-chip.open {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .status-chip.in-progress {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .status-chip.pending-review {
      background-color: #f3e5f5;
      color: #7b1fa2;
    }

    .status-chip.resolved {
      background-color: #e8f5e8;
      color: #388e3c;
    }

    .status-chip.closed {
      background-color: #f5f5f5;
      color: #666;
    }

    .status-chip.cancelled {
      background-color: #ffebee;
      color: #d32f2f;
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
export class EnquiryListComponent implements OnInit {
  enquiries: Enquiry[] = [];
  loading = true;
  displayedColumns = ['title', 'type', 'status', 'createdBy', 'createdAt', 'actions'];

  statusOptions = Object.values(EnquiryStatus);
  typeOptions = Object.values(EnquiryType);

  filterForm = new FormGroup({
    status: new FormControl([]),
    type: new FormControl([]),
    search: new FormControl('')
  });

  constructor(private enquiryService: EnquiryService) {}

  ngOnInit(): void {
    this.loadEnquiries();
  }

  loadEnquiries(): void {
    this.loading = true;
    this.enquiryService.getEnquiries().subscribe({
      next: (enquiries) => {
        this.enquiries = enquiries;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading enquiries:', error);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    const filters = this.filterForm.value;
    this.loading = true;
    
    this.enquiryService.getEnquiries({
      status: filters.status?.join(','),
      type: filters.type?.join(',')
    }).subscribe({
      next: (enquiries) => {
        let filteredEnquiries = enquiries;
        
        // Apply search filter locally
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredEnquiries = enquiries.filter(e => 
            e.title.toLowerCase().includes(searchTerm) ||
            e.description.toLowerCase().includes(searchTerm)
          );
        }
        
        this.enquiries = filteredEnquiries;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error applying filters:', error);
        this.loading = false;
      }
    });
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.loadEnquiries();
  }

  getStatusClass(status: EnquiryStatus): string {
    return `status-chip ${status.toLowerCase().replace('_', '-')}`;
  }
}