import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ProcessInstance, Task, TaskForm } from '../models/process.model';
import { Enquiry, Comment } from '../models/enquiry.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProcessService {
  private apiUrl = environment.api.processService;

  constructor(
    private http: HttpClient, 
    private authService: AuthService
  ) {}

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

  cancelEnquiry(processId: string, notes?: string): Observable<ProcessInstance> {
    const payload = notes ? { notes } : {};
    return this.http.post<ProcessInstance>(`${this.apiUrl}/EnquiryProcess/${processId}/cancel`, payload);
  }

  reopenEnquiry(processId: string, notes?: string): Observable<ProcessInstance> {
    const payload = notes ? { notes } : {};
    return this.http.post<ProcessInstance>(`${this.apiUrl}/EnquiryProcess/${processId}/reopen`, payload);
  }

  closeEnquiry(processId: string, notes?: string): Observable<ProcessInstance> {
    const payload = notes ? { notes } : {};
    return this.http.post<ProcessInstance>(`${this.apiUrl}/EnquiryProcess/${processId}/close`, payload);
  }

  // Task Management
  getProcessTasks(processId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/EnquiryProcess/${processId}/tasks`);
  }

  getAllTasks(): Observable<Task[]> {
    // Use usertasks API - token contains user information
    return this.http.get<any[]>(`${this.apiUrl}/usertasks/instance`)
      .pipe(
        map(bamoeTasks => bamoeTasks.map(bamoeTask => this.mapBamoeTaskToTask(bamoeTask))),
        catchError(error => {
          console.error('Error loading tasks:', error);
          return of([]);
        })
      );
  }

  private mapBamoeTaskToTask(bamoeTask: any): Task {
    console.log('ProcessService.mapBamoeTaskToTask: Mapping BAMOE task:', bamoeTask);
    console.log('ProcessService.mapBamoeTaskToTask: BAMOE task inputs:', bamoeTask.inputs);
    console.log('ProcessService.mapBamoeTaskToTask: BAMOE task enquiry:', bamoeTask.inputs?.enquiry);
    
    const mappedTask = {
      id: bamoeTask.id,
      name: bamoeTask.taskName,
      description: bamoeTask.taskDescription,
      processInstanceId: bamoeTask.metadata?.ProcessInstanceId || '',
      assignee: bamoeTask.actualOwner,
      candidateGroups: bamoeTask.potentialGroups || [],
      candidateUsers: bamoeTask.potentialUsers || [],
      created: new Date(), // BAMOE doesn't provide created date in this response
      due: undefined, // BAMOE doesn't provide due date in this response
      priority: bamoeTask.taskPriority || 0,
      status: this.mapBamoeStatusToTaskStatus(bamoeTask.status?.name),
      formKey: undefined,
      variables: bamoeTask.inputs || {},
      // Store the external reference ID for TaskSupport endpoint
      externalReferenceId: bamoeTask.externalReferenceId
    };
    
    console.log('ProcessService.mapBamoeTaskToTask: Mapped task variables:', mappedTask.variables);
    console.log('ProcessService.mapBamoeTaskToTask: Mapped task enquiry:', mappedTask.variables?.['enquiry']);
    console.log('ProcessService.mapBamoeTaskToTask: Mapped task enquiry status:', mappedTask.variables?.['enquiry']?.status);
    
    return mappedTask;
  }

  private mapBamoeStatusToTaskStatus(bamoeStatus: string): any {
    switch (bamoeStatus?.toLowerCase()) {
      case 'ready': return 'READY';
      case 'reserved': return 'RESERVED';
      case 'in_progress': return 'IN_PROGRESS';
      case 'completed': return 'COMPLETED';
      case 'failed': return 'FAILED';
      case 'error': return 'ERROR';
      case 'exited': return 'EXITED';
      case 'obsolete': return 'OBSOLETE';
      default: return 'CREATED';
    }
  }

  getTaskById(taskId: string): Observable<Task> {
    console.log('ProcessService.getTaskById: Calling usertasks endpoint:', `${this.apiUrl}/usertasks/instance/${taskId}`);
    return this.http.get<any>(`${this.apiUrl}/usertasks/instance/${taskId}`)
      .pipe(
        map(bamoeTask => {
          console.log('ProcessService.getTaskById: Raw usertasks response:', bamoeTask);
          console.log('ProcessService.getTaskById: Enquiry in usertasks response:', bamoeTask.inputs?.enquiry);
          console.log('ProcessService.getTaskById: Enquiry status in usertasks response:', bamoeTask.inputs?.enquiry?.status);
          const mappedTask = this.mapBamoeTaskToTask(bamoeTask);
          console.log('ProcessService.getTaskById: Mapped task:', mappedTask);
          console.log('ProcessService.getTaskById: Enquiry status in mapped task:', mappedTask.variables?.['enquiry']?.status);
          return mappedTask;
        }),
        catchError(error => {
          console.error('Error loading task:', error);
          throw error;
        })
      );
  }

  // User Task Management - using usertasks API
  getUserTaskById(taskId: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/usertasks/instance/${taskId}`);
  }

  getUserTaskInputs(taskId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/usertasks/instance/${taskId}/inputs`);
  }

  getUserTaskOutputs(taskId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/usertasks/instance/${taskId}/outputs`);
  }

  getUserTaskComments(taskId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usertasks/instance/${taskId}/comments`);
  }

  getUserTaskAttachments(taskId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usertasks/instance/${taskId}/attachments`);
  }

  // Process-specific task operations (for TaskSupport tasks)
  claimProcessTask(processInstanceId: string, taskId: string): Observable<any> {
    // For claiming tasks, use the generic usertasks endpoint with TransitionInfo schema
    return this.http.post<any>(`${this.apiUrl}/usertasks/instance/${taskId}/transition`, {
      transitionId: "claim"
    });
  }

  completeProcessTask(processInstanceId: string, taskId: string, formData?: any): Observable<any> {
    // Use PUT endpoint for completing TaskSupport tasks with task output schema
    return this.http.put(`${this.apiUrl}/EnquiryProcess/${processInstanceId}/TaskSupport/${taskId}`, formData || {});
  }

  getProcessTask(processInstanceId: string, taskId: string): Observable<any> {
    // Use GET endpoint for retrieving TaskSupport task details
    return this.http.get(`${this.apiUrl}/EnquiryProcess/${processInstanceId}/TaskSupport/${taskId}`);
  }

  getProcessInstance(processInstanceId: string): Observable<any> {
    // Get the process instance with current variables
    return this.http.get(`${this.apiUrl}/EnquiryProcess/${processInstanceId}`);
  }

  // Generic user task operations (for general usertasks)
  claimTask(taskId: string): Observable<Task> {
    return this.http.post<any>(`${this.apiUrl}/usertasks/instance/${taskId}/transition`, {
      transitionId: "claim"
    }).pipe(
      map(bamoeTask => this.mapBamoeTaskToTask(bamoeTask))
    );
  }

  releaseTask(taskId: string): Observable<Task> {
    return this.http.post<any>(`${this.apiUrl}/usertasks/instance/${taskId}/transition`, {
      transitionId: "release"
    }).pipe(
      map(bamoeTask => this.mapBamoeTaskToTask(bamoeTask))
    );
  }

  completeTask(taskId: string, formData?: any): Observable<Task> {
    return this.http.post<any>(`${this.apiUrl}/usertasks/instance/${taskId}/transition`, {
      transitionId: "complete",
      data: formData || {}
    }).pipe(
      map(bamoeTask => this.mapBamoeTaskToTask(bamoeTask))
    );
  }

  getTaskForm(taskId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/tasks/${taskId}/form`);
  }

  // Process Schema and Info
  getProcessSchema(): Observable<any> {
    return this.http.get(`${this.apiUrl}/EnquiryProcess/schema`);
  }

  getProcessInfo(processId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/EnquiryProcess/${processId}`);
  }

  getProcessSvg(processId: string): Observable<string> {
    return this.http.get(`${this.apiUrl}/svg/processes/EnquiryProcess/instances/${processId}`, { responseType: 'text' });
  }

  cancelProcessInstance(processId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/process/${processId}`);
  }

  // Process Management - using correct OpenAPI endpoints
  getProcessNodes(processId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/management/processes/EnquiryProcess/nodes`);
  }

  getProcessVariables(processId: string): Observable<any> {
    // Try the variables endpoint first, fallback to process instance data
    return this.http.get<any>(`${this.apiUrl}/management/processes/EnquiryProcess/instances/${processId}/variables`).pipe(
      catchError(() => {
        // Fallback to process instance data which might contain variables
        return this.http.get<any>(`${this.apiUrl}/management/processes/EnquiryProcess/instances/${processId}`);
      })
    );
  }

  getProcessHistory(processId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/management/processes/EnquiryProcess/instances/${processId}/nodeInstances`);
  }

  getProcessActivities(processId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/management/processes/EnquiryProcess/instances/${processId}/nodeInstances`);
  }

  getProcessImage(processId: string): Observable<string> {
    return this.http.get(`${this.apiUrl}/svg/processes/EnquiryProcess/instances/${processId}`, { responseType: 'text' });
  }

  // Process Comments - Comments are extracted from process variables (enquiry.comments)
  // No separate endpoint needed - use getProcessInfo() and extract from variables.enquiry.comments

  addProcessComment(processInstanceId: string, commentText: string): Observable<any> {
    // Send comment text as string to BAMOE process signal
    // User (userId, name, email) is automatically extracted from JWT token server-side
    console.log('Sending comment signal to BAMOE:', commentText);
    console.log('Endpoint:', `${this.apiUrl}/EnquiryProcess/${processInstanceId}/comment`);

    // Send signal with comment text as JSON string
    return this.http.post<any>(`${this.apiUrl}/EnquiryProcess/${processInstanceId}/comment`, JSON.stringify(commentText), {
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .pipe(
        catchError(error => {
          console.error('Error adding process comment:', error);
          console.error('Error details:', error.error);
          throw error;
        })
      );
  }

}