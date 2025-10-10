# Enquiry Management System

A modern Angular application for managing enquiries with integrated case management using IBM Business Automation Manager Open Edition (BAMOE) and Spring Boot.

## Features

- **Authentication & Authorization**: OAuth2/OIDC integration with Keycloak
- **Enquiry Management**: Create, view, edit, and track enquiries
- **Process Management**: Integration with Quarkus BAMOE for case management
- **Task Management**: View and manage process tasks
- **Modern UI**: Material Design components with responsive layout
- **Role-based Access**: Different views based on user roles

## Architecture

### Frontend (Angular)
- **Framework**: Angular 19 with standalone components
- **UI Library**: Angular Material
- **Authentication**: angular-oauth2-oidc
- **State Management**: RxJS Observables
- **Routing**: Lazy-loaded feature modules

### Backend Integration
- **Resource API**: Spring Boot REST API (http://localhost:8081/api)
- **Process API**: Quarkus BAMOE (http://localhost:8080)
- **Authentication**: Keycloak (http://localhost:9180)

## Project Structure

```
src/app/
├── core/                    # Core functionality
│   ├── auth/               # Authentication configuration
│   ├── guards/             # Route guards
│   ├── interceptors/       # HTTP interceptors
│   ├── interfaces/         # TypeScript interfaces
│   ├── models/             # Data models
│   └── services/           # Core services
├── features/               # Feature modules
│   ├── admin/              # Admin functionality
│   ├── auth/               # Authentication components
│   ├── dashboard/          # Dashboard
│   ├── enquiries/          # Enquiry management
│   ├── home/               # Home page
│   └── tasks/              # Task management
└── shared/                 # Shared components
    └── components/         # Reusable components
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Angular CLI 19+
- Keycloak server running on http://localhost:9180
- Spring Boot API running on http://localhost:8081
- Quarkus BAMOE running on http://localhost:8080

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure Keycloak:
   - Create realm: `quarkus-realm`
   - Create client: `quarkus-bamoe-frontend`
   - Configure redirect URIs: `http://localhost:4200/*`

3. Start the development server:
```bash
npm start
```

4. Navigate to `http://localhost:4200`

### Configuration

Update `src/environments/environment.ts` for your environment:

```typescript
export const environment = {
  production: false,
  auth: {
    provider: AuthProvider.KEYCLOAK,
    clientId: 'quarkus-bamoe-frontend',
    issuer: 'http://localhost:9180/realms/quarkus-realm',
    realm: 'quarkus-realm',
    scope: 'openid profile email',
    showDebugInformation: true,
    useSilentRefresh: true,
    requireHttps: false
  },
  api: {
    enquiryService: 'http://localhost:8081/api',
    processService: 'http://localhost:8080'
  }
};
```

## Key Components

### Authentication Flow
1. User clicks login → Redirected to Keycloak
2. User authenticates → Redirected back with tokens
3. Tokens stored and used for API calls
4. Automatic token refresh handled

### Enquiry Management Flow
1. User creates enquiry → Stored in Spring Boot API
2. Process instance created → Quarkus BAMOE
3. Tasks generated → Available in task list
4. Status updates → Synchronized between systems

### Navigation
- **Home**: Overview with recent enquiries and statistics
- **Enquiries**: Full enquiry list with filtering
- **Tasks**: Process tasks assigned to user
- **Admin**: Administrative functions (role-based)

## API Integration

### Data Flow Architecture
The system uses a **process instance ID** as the glue between Spring Boot (data) and Quarkus BAMOE (process):

1. **Enquiry Object** contains `processInstanceId` field
2. **Spring Boot** stores enquiry data with process instance reference
3. **BAMOE** manages process lifecycle and state changes
4. **Frontend** uses process instance ID to perform operations

### Spring Boot Enquiry Service (Data Layer)
**Base URL**: `http://localhost:8081/api`

**Read Operations:**
- `GET /enquiries` - List all enquiries (includes processInstanceId)
- `GET /enquiries/{id}` - Get enquiry details by ID
- `GET /enquiries/process/{processInstanceId}` - Get enquiry by process instance ID
- `GET /enquiries/{id}/comments` - Get enquiry comments

**Write Operations (Direct API):**
- `POST /enquiries` - Create enquiry directly
- `PUT /enquiries/{id}` - Update enquiry directly
- `DELETE /enquiries/{id}` - Delete enquiry
- `POST /enquiries/{id}/comments` - Add comment to enquiry
- `PUT /enquiries/{id}/comments/{commentId}` - Update comment
- `DELETE /enquiries/{id}/comments/{commentId}` - Delete comment
- `PATCH /enquiries/{id}/status?status={status}` - Update enquiry status
- `PATCH /enquiries/{id}/resolve?resolutionNotes={notes}` - Resolve enquiry
- `PATCH /enquiries/{id}/assign` - Assign enquiry to user

### Quarkus BAMOE Process Service (Process Layer)
**Base URL**: `http://localhost:8080`

**Process Management:**
- `POST /EnquiryProcess` - Create new enquiry (triggers process)
- `GET /EnquiryProcess` - List process instances
- `GET /EnquiryProcess/{id}` - Get process instance details
- `POST /EnquiryProcess/{id}/comment` - Add comment via process
- `POST /EnquiryProcess/{id}/cancel` - Cancel enquiry via process
- `POST /EnquiryProcess/{id}/reopen` - Reopen enquiry via process
- `POST /EnquiryProcess/{id}/close` - Close enquiry via process
- `GET /tasks` - List tasks
- `POST /tasks/{id}/complete` - Complete task

## Security

- OAuth2/OIDC authentication with Keycloak
- JWT token-based API authentication
- Role-based access control
- Automatic token refresh
- Secure HTTP interceptors

## Development

### Code Style
- TypeScript strict mode
- Angular standalone components
- Material Design guidelines
- Responsive design principles

### Testing
```bash
npm test
```

### Building
```bash
npm run build
```

## Deployment

1. Update environment configuration for production
2. Build the application: `npm run build`
3. Deploy the `dist/` folder to your web server
4. Configure reverse proxy for API calls
5. Update Keycloak client configuration

## Troubleshooting

### Common Issues

1. **Authentication fails**: Check Keycloak configuration and client settings
2. **API calls fail**: Verify backend services are running and accessible
3. **CORS errors**: Configure CORS in backend services
4. **Token refresh issues**: Check silent refresh configuration

### Debug Mode
Enable debug mode in environment configuration:
```typescript
auth: {
  showDebugInformation: true
}
```

## Contributing

1. Follow Angular style guide
2. Use TypeScript strict mode
3. Write unit tests for new features
4. Update documentation for API changes

## License

This project is part of the IBM Business Automation Manager Open Edition ecosystem.