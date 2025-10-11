export interface ProcessInstance {
  id: string;
  processId: string;
  processName: string;
  status: ProcessStatus;
  startDate: Date;
  endDate?: Date;
  initiator: string;
  variables: Record<string, any>;
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  processInstanceId: string;
  assignee?: string;
  candidateGroups?: string[];
  candidateUsers?: string[];
  created: Date;
  due?: Date;
  priority: number;
  status: TaskStatus;
  formKey?: string;
  variables: Record<string, any>;
  externalReferenceId?: string; // For TaskSupport endpoint
}

export interface TaskForm {
  taskId: string;
  formData: Record<string, any>;
}

export enum ProcessStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  SUSPENDED = 'SUSPENDED',
  ABORTED = 'ABORTED'
}

export enum TaskStatus {
  CREATED = 'CREATED',
  READY = 'READY',
  RESERVED = 'RESERVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  ERROR = 'ERROR',
  EXITED = 'EXITED',
  OBSOLETE = 'OBSOLETE'
}