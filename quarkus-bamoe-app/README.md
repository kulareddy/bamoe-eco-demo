# BAMOE 9.3 Quarkus Application

A complete BAMOE (Business Automation Management Open Edition) 9.3.0-ibm-0007 application built with Quarkus for business process automation, decision management, and case management.

## 🚀 Quick Start

### 1. Start the Ecosystem
```bash
# Start all services (PostgreSQL, Keycloak, Management Console)
# Keycloak realm and users are automatically configured
docker-compose up -d
```

### 2. Run the Application
```bash
# Development mode
./mvnw quarkus:dev
```

### 3. Access the Application
- **Application**: http://localhost:8080
- **Management Console**: http://localhost:9280
- **Keycloak Admin**: http://localhost:9180/admin (admin/admin123)
- **API Documentation**: http://localhost:8080/q/swagger-ui

## 🔐 Authentication

### Get Access Token
```bash
# Get token for API testing
TOKEN=$(curl -s -X POST "http://localhost:9180/realms/quarkus-realm/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin" \
  -d "password=admin123" \
  -d "grant_type=password" \
  -d "client_id=quarkus-bamoe-frontend" | jq -r '.access_token')
```

### Test API
```bash
# Test enquiry process
curl -X POST "http://localhost:8080/EnquiryProcess" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enquiry": {"title": "Test Enquiry", "description": "Test process"}}'
```

## 📋 Available Processes

### Enquiry Process
- **Start**: POST `/EnquiryProcess`
- **List**: GET `/EnquiryProcess`
- **Details**: GET `/EnquiryProcess/{id}`
- **Complete Task**: POST `/EnquiryProcess/{id}/tasks/{taskId}`

## 🛠️ Development

### Project Structure
```
src/main/java/com/example/bamoe/
├── model/           # Data models
├── service/         # Business services
├── client/          # External service clients
├── filter/          # Request/response filters
└── util/            # Utility classes

src/main/resources/
├── application.properties
├── EnquiryProcess.bpmn    # Process definition
└── ValidateEnquiryGroup.dmn  # Decision model
```

### Adding New Features
1. **Models**: Add to `src/main/java/com/example/bamoe/model/`
2. **Services**: Add to `src/main/java/com/example/bamoe/service/`
3. **Processes**: Add BPMN files to `src/main/resources/`
4. **Decisions**: Add DMN files to `src/main/resources/`

### Development Commands
```bash
# Run in development mode
./mvnw quarkus:dev

# Run tests
./mvnw test

# Package application
./mvnw package
```

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose --profile container up -d
```

## 🔧 Configuration

### Key Properties
- **Database**: PostgreSQL on port 5432
- **Keycloak**: http://localhost:9180/realms/quarkus-realm
- **Client ID**: quarkus-bamoe-frontend
- **Management Console**: http://localhost:9280

### Environment Variables
Create `.env` file with:
```bash
DB_NAME=enquiry-process
DB_USER=quarkus
DB_PASSWORD=quarkus
OIDC_AUTH_SERVER_URL=http://localhost:9180/realms/quarkus-realm
OIDC_CLIENT_ID=quarkus-bamoe-frontend
```

## 📚 Documentation

- **BAMOE Documentation**: https://www.ibm.com/docs/en/ibamoe/9.3.0
- **Quarkus Guides**: https://quarkus.io/guides/
- **Process Management**: Use the Management Console at http://localhost:9280

## 🆘 Troubleshooting

### Common Issues
1. **Port conflicts**: Check if ports 8080, 9180, 9280 are available
2. **Database connection**: Ensure PostgreSQL is running
3. **Authentication**: Verify Keycloak realm setup
4. **Process deployment**: Check BPMN syntax

### Health Checks
```bash
# Application health
curl http://localhost:8080/q/health

# Database connectivity
curl http://localhost:8080/q/health/ready
```

## 🎯 What's Included

- **BPMN Process Engine**: Business process automation
- **DMN Decision Engine**: Business rule management
- **OIDC Security**: Keycloak integration
- **Management Console**: Process monitoring and management
- **REST APIs**: Complete process management APIs
- **Docker Support**: Containerized deployment
- **PostgreSQL**: Persistent data storage

This template provides a complete foundation for building BAMOE applications with Quarkus. Use the Management Console to monitor processes, create new BPMN processes, and manage business rules.