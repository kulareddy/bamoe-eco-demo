import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Enquiry, Comment, EnquiryStatus, User } from '../models/enquiry.model';

export interface EnquirySearchParams {
  status?: string;
  type?: string;
  assignedTo?: string;
  page?: number;
  size?: number;
  sort?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EnquiryService {
  private apiUrl = environment.api.enquiryService;

  constructor(private http: HttpClient) {}

  // Read Operations - Spring Boot API
  getEnquiries(params?: EnquirySearchParams): Observable<Enquiry[]> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.type) httpParams = httpParams.set('type', params.type);
      if (params.assignedTo) httpParams = httpParams.set('assignedTo', params.assignedTo);
      if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
      if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
      if (params.sort) httpParams = httpParams.set('sort', params.sort);
    }
    
    return this.http.get<Enquiry[]>(`${this.apiUrl}/enquiries`, { params: httpParams });
  }

  getEnquiryById(id: string): Observable<Enquiry> {
    return this.http.get<Enquiry>(`${this.apiUrl}/enquiries/${id}`);
  }

  getEnquiryByProcessInstanceId(processInstanceId: string): Observable<Enquiry> {
    return this.http.get<Enquiry>(`${this.apiUrl}/enquiries/process/${processInstanceId}`);
  }

  getEnquiryComments(enquiryId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/enquiries/${enquiryId}/comments`);
  }

  // Write Operations - Spring Boot API (for direct updates)
  createEnquiry(enquiry: Partial<Enquiry>): Observable<Enquiry> {
    return this.http.post<Enquiry>(`${this.apiUrl}/enquiries`, enquiry);
  }

  updateEnquiry(id: string, enquiry: Partial<Enquiry>): Observable<Enquiry> {
    return this.http.put<Enquiry>(`${this.apiUrl}/enquiries/${id}`, enquiry);
  }

  deleteEnquiry(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/enquiries/${id}`);
  }

  addComment(enquiryId: string, comment: Partial<Comment>): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/enquiries/${enquiryId}/comments`, comment);
  }

  updateComment(enquiryId: string, commentId: string, comment: Partial<Comment>): Observable<Comment> {
    return this.http.put<Comment>(`${this.apiUrl}/enquiries/${enquiryId}/comments/${commentId}`, comment);
  }

  deleteComment(enquiryId: string, commentId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/enquiries/${enquiryId}/comments/${commentId}`);
  }

  updateStatus(enquiryId: string, status: EnquiryStatus): Observable<Enquiry> {
    return this.http.patch<Enquiry>(`${this.apiUrl}/enquiries/${enquiryId}/status?status=${status}`, {});
  }

  resolveEnquiry(enquiryId: string, resolutionNotes: string): Observable<Enquiry> {
    return this.http.patch<Enquiry>(`${this.apiUrl}/enquiries/${enquiryId}/resolve?resolutionNotes=${encodeURIComponent(resolutionNotes)}`, {});
  }

  assignEnquiry(enquiryId: string, assignee: User): Observable<Enquiry> {
    return this.http.patch<Enquiry>(`${this.apiUrl}/enquiries/${enquiryId}/assign`, assignee);
  }
}