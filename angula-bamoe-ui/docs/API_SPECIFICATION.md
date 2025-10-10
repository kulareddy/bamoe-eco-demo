# API Specification

This document provides the complete API specification for both the Spring Boot Enquiry Service and Quarkus BAMOE Process Service based on their OpenAPI specifications.

## Spring Boot Enquiry Service

**Base URL**: `http://localhost:8081/api`  
**Authentication**: Bearer JWT Token  
**Content-Type**: `application/json`

### Data Models

#### Enquiry
```typescript
interface Enquiry {
  id?: string;                    // UUID
  processInstanceId?: string;     // Link to BAMOE process
  title: string;                  // Max 255 chars
  description: string;            // Max 2000 chars
  type: EnquiryType;             // TECH_SUPPORT, BUSINESS_CASE, INCIDENT
  status: EnquiryStatus;         // OPEN, IN_PROGRESS, RESOLVED, CLOSED, CANCELLED
  reporter?: User;               // User who created the enquiry
  assignee?: User;               // User assigned to the enquiry
  resolutionNotes?: string;      // Max 2000 chars
  comments?: Comment[];          // Array of comments
  createdAt?: Date;              // ISO 8601 datetime
  updatedAt?: Date;              // ISO 8601 datetime
  resolvedAt?: Date;             // ISO 8601 datetime
}
```

#### Comment
```typescript
interface Comment {
  id?: string;                   // UUID
  comment: string;               // Max 2000 chars
  commentedBy: User;             // User who made the comment
  commentedAt?: Date;            // ISO 8601 datetime
  enquiry?: Enquiry;             // Reference to parent enquiry
}
```

#### User
```typescript
interface User {
  name: string;                  // Max 100 chars
  email: string;                 // Max 255 chars
}
```

### Endpoints

#### Read Operations

**GET /enquiries**
- **Description**: List all enquiries
- **Response**: `Enquiry[]`
- **Status Codes**: 200 OK

**GET /enquiries/{id}**
- **Description**: Get enquiry details by ID
- **Parameters**: 
  - `id` (path, required): UUID of the enquiry
- **Response**: `Enquiry`
- **Status Codes**: 200 OK

**GET /enquiries/process/{processInstanceId}**
- **Description**: Get enquiry by process instance ID
- **Parameters**:
  - `processInstanceId` (path, required): Process instance ID
- **Response**: `Enquiry`
- **Status Codes**: 200 OK

**GET /enquiries/{id}/comments**
- **Description**: Get comments for an enquiry
- **Parameters**:
  - `id` (path, required): UUID of the enquiry
- **Response**: `Comment[]`
- **Status Codes**: 200 OK

#### Write Operations

**POST /enquiries**
- **Description**: Create a new enquiry
- **Request Body**: `Enquiry` (without id, timestamps)
- **Response**: `Enquiry`
- **Status Codes**: 200 OK

**PUT /enquiries/{id}**
- **Description**: Update an enquiry
- **Parameters**:
  - `id` (path, required): UUID of the enquiry
- **Request Body**: `Enquiry`
- **Response**: `Enquiry`
- **Status Codes**: 200 OK

**DELETE /enquiries/{id}**
- **Description**: Delete an enquiry
- **Parameters**:
  - `id` (path, required): UUID of the enquiry
- **Response**: Empty
- **Status Codes**: 200 OK

**POST /enquiries/{id}/comments**
- **Description**: Add a comment to an enquiry
- **Parameters**:
  - `id` (path, required): UUID of the enquiry
- **Request Body**: `Comment` (without id, timestamps)
- **Response**: `Comment`
- **Status Codes**: 200 OK

**PUT /enquiries/{id}/comments/{commentId}**
- **Description**: Update a comment
- **Parameters**:
  - `id` (path, required): UUID of the enquiry
  - `commentId` (path, required): UUID of the comment
- **Request Body**: `Comment`
- **Response**: `Comment`
- **Status Codes**: 200 OK

**DELETE /enquiries/{id}/comments/{commentId}**
- **Description**: Delete a comment
- **Parameters**:
  - `id` (path, required): UUID of the enquiry
  - `commentId` (path, required): UUID of the comment
- **Response**: Empty
- **Status Codes**: 200 OK

**PATCH /enquiries/{id}/status**
- **Description**: Update enquiry status
- **Parameters**:
  - `id` (path, required): UUID of the enquiry
  - `status` (query, required): New status (OPEN, IN_PROGRESS, RESOLVED, CLOSED, CANCELLED)
- **Response**: `Enquiry`
- **Status Codes**: 200 OK

**PATCH /enquiries/{id}/resolve**
- **Description**: Resolve an enquiry
- **Parameters**:
  - `id` (path, required): UUID of the enquiry
  - `resolutionNotes` (query, required): Resolution notes
- **Response**: `Enquiry`
- **Status Codes**: 200 OK

**PATCH /enquiries/{id}/assign**
- **Description**: Assign enquiry to a user
- **Parameters**:
  - `id` (path, required): UUID of the enquiry
- **Request Body**: `User`
- **Response**: `Enquiry`
- **Status Codes**: 200 OK

## Quarkus BAMOE Process Service

**Base URL**: `http://localhost:8080`  
**Authentication**: Bearer JWT Token  
**Content-Type**: `application/json`

### Process Management Endpoints

**POST /EnquiryProcess**
- **Description**: Create new enquiry process instance
- **Request Body**: `{ enquiry: Enquiry }`
- **Response**: `ProcessInstance`
- **Status Codes**: 200 OK, 201 Created

**GET /EnquiryProcess**
- **Description**: List all process instances
- **Response**: `ProcessInstance[]`
- **Status Codes**: 200 OK

**GET /EnquiryProcess/{id}**
- **Description**: Get process instance details
- **Parameters**:
  - `id` (path, required): Process instance ID
- **Response**: `ProcessInstance`
- **Status Codes**: 200 OK

**POST /EnquiryProcess/{id}/comment**
- **Description**: Add comment via process
- **Parameters**:
  - `id` (path, required): Process instance ID
- **Request Body**: `Comment`
- **Response**: Process result
- **Status Codes**: 200 OK

**POST /EnquiryProcess/{id}/cancel**
- **Description**: Cancel enquiry via process
- **Parameters**:
  - `id` (path, required): Process instance ID
- **Request Body**: `{}`
- **Response**: Process result
- **Status Codes**: 200 OK

**POST /EnquiryProcess/{id}/reopen**
- **Description**: Reopen enquiry via process
- **Parameters**:
  - `id` (path, required): Process instance ID
- **Request Body**: `{}`
- **Response**: Process result
- **Status Codes**: 200 OK

**POST /EnquiryProcess/{id}/close**
- **Description**: Close enquiry via process
- **Parameters**:
  - `id` (path, required): Process instance ID
- **Request Body**: `{}`
- **Response**: Process result
- **Status Codes**: 200 OK

### Task Management Endpoints

**GET /tasks**
- **Description**: List all tasks
- **Response**: `Task[]`
- **Status Codes**: 200 OK

**GET /EnquiryProcess/{id}/tasks**
- **Description**: Get tasks for a process instance
- **Parameters**:
  - `id` (path, required): Process instance ID
- **Response**: `Task[]`
- **Status Codes**: 200 OK

**POST /tasks/{id}/complete**
- **Description**: Complete a task
- **Parameters**:
  - `id` (path, required): Task ID
- **Request Body**: Task completion data
- **Response**: Task result
- **Status Codes**: 200 OK

## Integration Pattern

### Process Instance ID as Glue

The `processInstanceId` field in the Enquiry object serves as the bridge between the two services:

1. **Create Flow**:
   ```
   Frontend → BAMOE POST /EnquiryProcess → ProcessInstance
   BAMOE → Spring Boot (stores enquiry with processInstanceId)
   ```

2. **Read Flow**:
   ```
   Frontend → Spring Boot GET /enquiries → Enquiry[] (with processInstanceId)
   Frontend → BAMOE GET /EnquiryProcess/{processInstanceId} → ProcessInstance
   ```

3. **Update Flow**:
   ```
   Frontend → BAMOE POST /EnquiryProcess/{processInstanceId}/action
   BAMOE → Spring Boot (updates enquiry data)
   ```

### Error Handling

Both services return standard HTTP status codes:
- `200 OK`: Success
- `400 Bad Request`: Invalid request
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

### Authentication

All endpoints require Bearer JWT token authentication:
```
Authorization: Bearer <jwt-token>
```

The JWT token should contain user information and roles for authorization decisions.

### User Information Propagation

User information is automatically extracted from the JWT token and propagated to the backend:

**Token Claims Used:**
- `sub` - User ID
- `name` or `preferred_username` - User display name
- `email` - User email address
- `roles` - User roles array
- `groups` - User groups array

**Frontend Implementation:**
```typescript
// AuthService.getCurrentUser() extracts user from token
const currentUser = this.authService.getCurrentUser();
// Returns: { id, name, email, roles }

// Automatically added to enquiry creation
const enquiry = {
  ...enquiryData,
  reporter: currentUser  // User from token
};
```

**Backend Integration:**
- Spring Boot API receives user information in request body
- BAMOE process service uses user context for process operations
- No manual user input required - all user data comes from authentication token