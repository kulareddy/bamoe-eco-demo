export interface Enquiry {
  id?: string;
  processInstanceId?: string; // Link to BAMOE process instance
  title: string;
  description: string;
  type: EnquiryType;
  status: EnquiryStatus;
  reporter?: User; // The user who reported the enquiry
  assignee?: User; // Maps to assignedTo
  assignedTo?: User; // Alternative name for assignee
  resolutionNotes?: string;
  comments?: Comment[];
  createdAt?: Date;
  updatedAt?: Date;
  resolvedAt?: Date;
}

export interface Comment {
  id?: string;
  comment: string;
  commentedBy: User;
  commentedAt?: Date;
  enquiry?: Enquiry;
}

export interface User {
  id?: string;
  name: string;
  email: string;
  userId?: string;
  roles?: string[];
}

export enum EnquiryType {
  TECH_SUPPORT = 'TECH_SUPPORT',
  BUSINESS_CASE = 'BUSINESS_CASE',
  INCIDENT = 'INCIDENT'
}

export enum EnquiryStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED'
}
