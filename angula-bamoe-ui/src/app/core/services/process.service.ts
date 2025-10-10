import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProcessInstance, Task, TaskForm } from '../models/process.model';
import { Enquiry } from '../models/enquiry.model';

@Injectable({
  providedIn: 'root'
})
export class ProcessService {
  private apiUrl = environment.api.processService;

  constructor(private http: HttpClient) {}

  // Process Instance Management - Quarkus BAMOE
  getAllProcesses(): Observable<ProcessInstance[]> {
    return this.http.get<ProcessInstance[]>(`${this.apiUrl}/EnquiryProcess`);
  }

  getProcessById(id: string): Observable<ProcessInstance> {
    return this.http.get<ProcessInstance>(`${this.apiUrl}/EnquiryProcess/${id}`);
  }

  // Enquiry Management Operations (Write Operations)
  createEnquiry(enquiry: Partial<Enquiry>): Observable<ProcessInstance> {
    return this.http.post<ProcessInstance>(`${this.apiUrl}/EnquiryProcess`, { enquiry });
  }

  addEnquiryComment(processId: string, comment: Partial<Comment>): Observable<any> {
    return this.http.post(`${this.apiUrl}/EnquiryProcess/${processId}/comment`, comment);
  }

  cancelEnquiry(processId: string): Observable<ProcessInstance> {
    return this.http.post<ProcessInstance>(`${this.apiUrl}/EnquiryProcess/${processId}/cancel`, {});
  }

  reopenEnquiry(processId: string): Observable<ProcessInstance> {
    return this.http.post<ProcessInstance>(`${this.apiUrl}/EnquiryProcess/${processId}/reopen`, {});
  }

  closeEnquiry(processId: string): Observable<ProcessInstance> {
    return this.http.post<ProcessInstance>(`${this.apiUrl}/EnquiryProcess/${processId}/close`, {});
  }

  // Task Management
  getProcessTasks(processId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/EnquiryProcess/${processId}/tasks`);
  }

  getAllTasks(params?: any): Observable<Task[]> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<Task[]>(`${this.apiUrl}/tasks`, { params: httpParams });
  }

  getTaskById(taskId: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/tasks/${taskId}`);
  }

  claimTask(taskId: string): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/tasks/${taskId}/claim`, {});
  }

  releaseTask(taskId: string): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/tasks/${taskId}/release`, {});
  }

  completeTask(taskId: string, formData?: any): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/tasks/${taskId}/complete`, formData || {});
  }

  getTaskForm(taskId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/tasks/${taskId}/form`);
  }

  // Process Schema and Info
  getProcessSchema(): Observable<any> {
    return this.http.get(`${this.apiUrl}/EnquiryProcess/schema`);
  }

  getProcessInfo(processId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/process/${processId}`);
  }

  getProcessSvg(processId: string): Observable<string> {
    return this.http.get(`${this.apiUrl}/process/${processId}/image`, { responseType: 'text' });
  }

  cancelProcessInstance(processId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/process/${processId}`);
  }
}