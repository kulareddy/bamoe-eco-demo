# Spring Boot Enquiry Management API

A modern Spring Boot REST API for managing enquiries (tech support, business cases, incidents) with JWT authentication and functional programming.

## Features

- **CRUD Operations**: Create, read, update, delete enquiries
- **JWT Authentication**: OAuth2 resource server with Keycloak/Azure Entra ID support
- **Complex User Objects**: Reporter and assignee with name and email
- **Flexible Search**: Multi-criteria search with pagination
- **Functional Programming**: Immutable objects and functional operations
- **Database**: JPA with H2 (dev) and PostgreSQL (prod)
- **Migrations**: Flyway database versioning

## Tech Stack

- Spring Boot 3.5.3
- Spring Security (OAuth2 Resource Server)
- Spring Data JPA
- H2 Database (dev) / PostgreSQL (prod)
- Flyway
- Maven

## Quick Start

### Prerequisites

- Java 17+
- Maven 3.6+

### Build

```bash
./mvnw clean install
```

### Run

```bash
# Development (H2 database)
./mvnw spring-boot:run

# Production (PostgreSQL)
./mvnw spring-boot:run -Dspring.profiles.active=prod
```

### Test

```bash
./mvnw test
```

## Configuration

### OAuth2/OIDC Configuration

For detailed OAuth2 and OIDC configuration (Keycloak, Azure Entra ID, etc.), see:
📖 **[OAuth2 Configuration Guide](../angula-bamoe-ui/docs/OAUTH2_CONFIGURATION.md)**

### Environment Variables

Create `.env` file:

```bash
# OIDC Configuration
OIDC_AUTH_SERVER_URL=http://localhost:9180/realms/artifact-realm
OIDC_CLIENT_ID=spring-boot-api
OIDC_CLIENT_SECRET=spring-boot-api-secret
OAUTH_SCOPE=openid profile email

# Database (Production)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=springbootapi
DB_USER=springbootapi
DB_PASSWORD=Ch@ngeme
```

### Security

- **JWT Validation**: Uses public keys from JWK Set URI
- **Authentication**: All endpoints require valid JWT token
- **Roles**: Supports `admin`, `user`, `readonly` roles

## API Endpoints

### Basic CRUD

```http
POST   /api/enquiries           # Create enquiry
GET    /api/enquiries           # Get all enquiries (paginated)
GET    /api/enquiries/{id}      # Get enquiry by ID
PUT    /api/enquiries/{id}      # Update enquiry
DELETE /api/enquiries/{id}      # Delete enquiry
```

### Operations

```http
PATCH  /api/enquiries/{id}/status    # Update status
PATCH  /api/enquiries/{id}/assign    # Assign enquiry
PATCH  /api/enquiries/{id}/resolve   # Resolve enquiry
```

### Search & Metadata

```http
POST   /api/enquiries/search     # Search enquiries
GET    /api/enquiries/types      # Available types
GET    /api/enquiries/statuses   # Available statuses
```

## Usage Examples

### Create Enquiry

```bash
curl -X POST http://localhost:8080/api/enquiries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "System Bug Report",
    "description": "Application crashes on login",
    "type": "INCIDENT",
    "reporter": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }'
```

### Assign Enquiry

```bash
curl -X PATCH http://localhost:8080/api/enquiries/1/assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com"
  }'
```

### Search Enquiries

```bash
curl -X POST http://localhost:8080/api/enquiries/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "type": "INCIDENT",
    "status": "OPEN",
    "reporter": {
      "name": "John",
      "email": "john@example.com"
    },
    "titleContains": "bug"
  }'
```

## Data Model

### Enquiry Types
- `TECH_SUPPORT` - Technical support requests
- `BUSINESS_CASE` - Business case enquiries
- `INCIDENT` - System incidents

### Enquiry Statuses
- `OPEN` - New enquiry
- `IN_PROGRESS` - Being worked on
- `RESOLVED` - Issue resolved
- `CLOSED` - Enquiry closed
- `CANCELLED` - Enquiry cancelled

### User Object
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

## Database

### Development
- **H2 Console**: http://localhost:8080/h2-console
- **JDBC URL**: `jdbc:h2:mem:testdb`
- **Username**: `sa`
- **Password**: (empty)

### Production
- **PostgreSQL** with Flyway migrations
- **Connection**: Configured via environment variables

## API Documentation

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI Spec**: http://localhost:8080/api-docs

## Profiles

- **Default**: H2 database, development settings
- **Prod**: PostgreSQL database, production settings
- **Test**: Test configuration for unit tests