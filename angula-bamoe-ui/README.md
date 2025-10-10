# Enquiry Process Management - Angular UI

A modern Angular 19 application for managing enquiry processes with vendor-agnostic OAuth/OIDC authentication and BAMOE process engine integration.

## 📚 Documentation

- **[OAuth Configuration Guide](./docs/OAUTH_CONFIGURATION.md)** - Complete setup for multiple OAuth providers (Keycloak, Entra ID, Auth0, Generic OIDC)
- **[Environment Setup Guide](./docs/ENVIRONMENT_SETUP.md)** - Configuration management and environment variables
- **[Enquiry Management System Guide](./docs/ENQUIRY_MANAGEMENT_README.md)** - Detailed system architecture and features
- **[API Specification](./docs/API_SPECIFICATION.md)** - Complete API documentation for both Spring Boot and BAMOE services
- **[Architecture Diagram](./docs/ARCHITECTURE_DIAGRAM.md)** - Visual representation of the process instance ID integration

## 🏗️ Architecture

- **Frontend**: Angular 19 with Material Design
- **Authentication**: Vendor-agnostic OAuth/OIDC (Keycloak, Entra ID, Auth0, Generic OIDC)
- **Process Engine**: Quarkus BAMOE 
- **API Backend**: Spring Boot (Enquiry Service)
- **Database**: PostgreSQL
- **Message Broker**: Apache Kafka

## 🚀 Features

- **Authentication & Authorization**
  - Vendor-agnostic OAuth/OIDC with support for multiple providers
  - Easily switch between Keycloak, Microsoft Entra ID, Auth0, or any OIDC provider
  - Role-based access control with configurable role mappings
  - Multiple user roles: admin, manager, user, analyst, tech-support, business-support
  - Protected routes and role-based UI components

- **Multi-Provider OAuth Support**
  - **Keycloak**: Enterprise-grade open-source identity management
  - **Microsoft Entra ID**: Azure Active Directory integration
  - **Auth0**: Cloud-based identity platform
  - **Generic OIDC**: Any OpenID Connect compliant provider
  - Configuration-driven provider switching (no code changes required)

- **Enquiry Management**
  - Create, view, edit, and search enquiries
  - Multiple enquiry types: General, Tech Support, Business Support, Billing, Feature Request
  - Status tracking: Open, In Progress, Pending Review, Resolved, Closed, Cancelled
  - Priority levels: Low, Medium, High, Critical

- **Process Lifecycle**
  - BPMN process integration with Quarkus BAMOE
  - Task assignment and completion
  - Process instance tracking
  - Comments and status updates

- **Dashboard & Analytics**
  - Overview of enquiry statistics
  - My tasks view
  - Recent activity tracking

- **Admin Features**
  - User management (via Keycloak)
  - System administration

## 🛠️ Prerequisites

- Node.js 18+ and npm
- Angular CLI 19
- OAuth/OIDC Provider (Keycloak, Entra ID, Auth0, or any OIDC-compliant provider)
- Docker and Docker Compose (for backend services)

## ⚡ Quick Start

### 1. OAuth Provider Setup

Choose your preferred OAuth provider and configure it according to the [OAuth Configuration Guide](./docs/OAUTH_CONFIGURATION.md).

**Default (Keycloak)**: The application comes pre-configured for Keycloak. Start the backend services:
```bash
cd ../quarkus-bamoe-app
docker-compose up -d
```

**Other Providers**: See [OAuth Configuration Guide](./docs/OAUTH_CONFIGURATION.md) for detailed setup instructions for Microsoft Entra ID, Auth0, or generic OIDC providers.

### 2. Configure Authentication

Update `src/environments/environment.ts` with your OAuth provider settings:

```typescript
export const environment = {
  production: false,
  authProvider: 'keycloak', // or 'entra', 'auth0', 'generic'
  authConfig: {
    issuer: 'http://localhost:8080/realms/your-realm',
    clientId: 'your-client-id',
    redirectUri: window.location.origin,
    scope: 'openid profile email',
    // ... provider-specific configuration
  }
};
```

## 📦 Installation

1. **Install Node.js dependencies**
   ```bash
   npm install
   ```

2. **Start backend services**
   ```bash
   # Navigate to the Quarkus BAMOE app directory
   cd ../quarkus-bamoe-app
   
   # Start all services with Docker Compose
   docker-compose up -d
   ```

3. **Configure environment**
   - Update `src/environments/environment.ts` if needed
   - Default configuration points to:
     - Keycloak: http://localhost:9180
     - Process Service: http://localhost:8080
     - Enquiry Service: http://localhost:8081

## 🚀 Development

1. **Start the development server**
   ```bash
   npm start
   # or
   ng serve
   ```

2. **Access the application**
   - Application: http://localhost:4200
   - Keycloak Admin: http://localhost:9180/admin (admin/admin123)

## 👥 Default Users

| Username | Password | Role | Description |
|----------|----------|------|-------------|
| admin | admin123 | admin | System administrator |
| manager1 | manager123 | manager | Process manager |
| user1 | user123 | user | Regular user |
| analyst1 | analyst123 | analyst | Business analyst |
| tech1 | tech123 | tech-support | Technical support |
| business1 | business123 | business-support | Business support |

## 🏛️ Project Structure

```
src/
├── app/
│   ├── core/                     # Core functionality
│   │   ├── auth/                 # Keycloak initialization
│   │   ├── guards/               # Route guards
│   │   ├── interceptors/         # HTTP interceptors
│   │   ├── models/               # Data models
│   │   └── services/             # API services
│   ├── features/                 # Feature modules
│   │   ├── auth/                 # Authentication components
│   │   ├── dashboard/            # Dashboard
│   │   ├── enquiries/            # Enquiry management
│   │   ├── tasks/                # Task management
│   │   └── admin/                # Administration
│   ├── shared/                   # Shared components
│   │   └── components/           # Reusable components
│   ├── app.component.ts          # Root component
│   └── app.routes.ts             # Application routes
├── environments/                 # Environment configurations
└── styles.scss                  # Global styles
```

## 🔧 Configuration

For detailed configuration instructions, see the [Environment Setup Guide](./docs/ENVIRONMENT_SETUP.md).

### Quick Configuration

Update `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  keycloak: {
    url: 'http://localhost:9180',
    realm: 'quarkus-realm',
    clientId: 'quarkus-bamoe-frontend'
  },
  api: {
    enquiryService: 'http://localhost:8081/api',
    processService: 'http://localhost:8080'
  }
};
```

### Keycloak Configuration

The application is configured to work with the Keycloak setup in the BAMOE project:
- Realm: `quarkus-realm`
- Client ID: `quarkus-bamoe-frontend` (public client)
- Roles and users are automatically configured via the setup scripts

For advanced configuration options, see the [Environment Setup Guide](./docs/ENVIRONMENT_SETUP.md).

## 🔗 API Integration

### Data Flow Architecture
The system uses a **process instance ID** as the glue between Spring Boot (data) and Quarkus BAMOE (process):

1. **Enquiry Object** contains `processInstanceId` field
2. **Spring Boot** stores enquiry data with process instance reference  
3. **BAMOE** manages process lifecycle and state changes
4. **Frontend** uses process instance ID to perform operations

### Spring Boot Enquiry Service (Data Layer)
- **Base URL**: http://localhost:8081/api
- **Purpose**: Data storage and retrieval
- **Key Endpoints**:
  - `GET /enquiries` - List all enquiries (includes processInstanceId)
  - `GET /enquiries/{id}` - Get enquiry details by ID
  - `GET /enquiries/process/{processInstanceId}` - Get enquiry by process instance ID
  - `GET /enquiries/{id}/comments` - Get enquiry comments
  - `POST /enquiries` - Create enquiry directly
  - `PATCH /enquiries/{id}/status` - Update enquiry status
  - `PATCH /enquiries/{id}/assign` - Assign enquiry to user

### Quarkus BAMOE Process Service (Process Layer)
- **Base URL**: http://localhost:8080
- **Purpose**: Process management and workflow orchestration
- **Key Endpoints**:
  - `POST /EnquiryProcess` - Create new enquiry (triggers process)
  - `GET /EnquiryProcess` - List process instances
  - `POST /EnquiryProcess/{id}/comment` - Add comment via process
  - `POST /EnquiryProcess/{id}/cancel` - Cancel enquiry via process
  - `POST /EnquiryProcess/{id}/reopen` - Reopen enquiry via process
  - `POST /EnquiryProcess/{id}/close` - Close enquiry via process
  - `GET /tasks` - List tasks
  - `POST /tasks/{id}/complete` - Complete task

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run e2e tests
npm run e2e

# Run linting
npm run lint
```

## 🏗️ Build

```bash
# Development build
npm run build

# Production build
npm run build:prod
```

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build:prod
   ```

2. **Deploy the `dist/` folder to your web server**

3. **Configure environment variables for production**

## 🛡️ Security

- All API calls are authenticated using Keycloak tokens
- Route guards protect sensitive areas based on user roles
- CSRF protection via Angular built-in mechanisms
- Secure token storage using Keycloak-js

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is part of the BAMOE Enquiry Process Management system.

## 🔧 Troubleshooting

### Common Issues

1. **Keycloak Connection Issues**
   - Ensure Keycloak is running on port 9180
   - Check the realm and client configuration
   - Verify CORS settings in Keycloak

2. **API Connection Issues**
   - Verify backend services are running
   - Check environment configuration
   - Ensure proper CORS configuration on backend

3. **Authentication Issues**
   - Clear browser storage and cookies
   - Check Keycloak logs for errors
   - Verify user roles and permissions

### Logs and Debugging

- Browser DevTools Console for frontend errors
- Keycloak Admin Console for authentication issues
- Backend service logs for API issues

## 📞 Support

For support and questions, please refer to the project documentation or contact the development team.

## 📖 Additional Documentation

- **[OAuth Configuration Guide](./docs/OAUTH_CONFIGURATION.md)** - Complete setup for multiple OAuth providers
- **[Environment Setup Guide](./docs/ENVIRONMENT_SETUP.md)** - Configuration management and environment variables  
- **[Enquiry Management System Guide](./docs/ENQUIRY_MANAGEMENT_README.md)** - Detailed system architecture and features