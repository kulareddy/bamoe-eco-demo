# BAMOE 9.3 Quarkus Reference Template

Complete BAMOE 9.3.0-ibm-0007 application with Quarkus, OIDC security, and date serialization patterns.

## 🚀 Quick Start

```bash
# Clone and setup
git clone <repo-url>
cd quarkus-bamoe-app
cp .env.example .env

# Start ecosystem
docker-compose up -d

# Run application
./mvnw quarkus:dev
```

**Access Points:**
- Application: http://localhost:8080
- Management Console: http://localhost:9280
- Keycloak: http://localhost:9180/admin (admin/admin123)

## 📦 Dependencies

### Core BAMOE Stack
```xml
<dependency>
    <groupId>org.jbpm</groupId>
    <artifactId>jbpm-with-drools-quarkus</artifactId>
</dependency>
<dependency>
    <groupId>org.kie</groupId>
    <artifactId>kie-addons-quarkus-persistence-jdbc</artifactId>
</dependency>
<dependency>
    <groupId>org.kie</groupId>
    <artifactId>kie-addons-quarkus-process-management</artifactId>
</dependency>
<dependency>
    <groupId>org.kie</groupId>
    <artifactId>kogito-addons-quarkus-data-index-jpa</artifactId>
</dependency>
```

### OIDC Security Stack
```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-oidc</artifactId>
</dependency>
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-oidc-client</artifactId>
</dependency>
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-resteasy-client-oidc-filter</artifactId>
</dependency>
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-resteasy-client-oidc-token-propagation</artifactId>
</dependency>
```

## ⚙️ Configuration

### Core Properties
```properties
# Jackson Date Serialization (Critical for Management Console)
quarkus.jackson.write-dates-as-timestamps=false
quarkus.jackson.write-durations-as-timestamps=false

# BAMOE Persistence
kogito.persistence.type=jdbc
kogito.persistence.proto.marshaller=true
kogito.persistence.optimistic.lock=true

# BAMOE Services
kogito.service.url=http://localhost:${quarkus.http.port}
kogito.data-index.url=http://localhost:${quarkus.http.port}
kogito.jobs-service.url=http://localhost:${quarkus.http.port}
```

### OIDC Security
```properties
# OIDC Provider
quarkus.oidc.enabled=true
quarkus.oidc.auth-server-url=${OIDC_AUTH_SERVER_URL}
quarkus.oidc.client-id=${OIDC_CLIENT_ID}
quarkus.oidc.credentials.secret=${OIDC_CLIENT_SECRET}
quarkus.oidc.application-type=service

# KOGITO Security
kogito.security.auth.enabled=true
kogito.security.auth.impersonation.allowed-for-roles=Managers

# Endpoint Protection
quarkus.http.auth.permission.authenticated.paths=/*
quarkus.http.auth.permission.authenticated.policy=authenticated
quarkus.http.auth.permission.public.paths=/q/*,/docs/*
quarkus.http.auth.permission.public.policy=permit
```

### REST Client with Token Propagation
```properties
quarkus.rest-client.external-service.url=${EXTERNAL_SERVICE_URL}
quarkus.oidc-client.auth-server-url=${OIDC_AUTH_SERVER_URL}
quarkus.oidc-client.client-id=${OIDC_CLIENT_ID}
quarkus.oidc-client.credentials.secret=${OIDC_CLIENT_SECRET}
quarkus.oidc-client.grant.type=client_credentials
```

## 🐳 Docker Compose Ecosystem

### Full BAMOE 9.3 Stack
```yaml
services:
  # BAMOE Maven Repository
  bamoe-maven-repo:
    image: quay.io/bamoe/maven-repository:9.3.0-ibm-0007
    ports: ["9080:8080"]

  # PostgreSQL Database
  quarkus-postgres:
    image: postgres:17-alpine
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports: ["5432:5432"]
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/postgres/init-databases.sh:/docker-entrypoint-initdb.d/

  # Keycloak Identity Provider
  keycloak:
    image: quay.io/keycloak/keycloak:24.0
    command: ["start-dev"]
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin123
      KC_HOSTNAME: localhost
      KC_HOSTNAME_PORT: 9180
      KC_HTTP_ENABLED: true
    ports: ["9180:8080"]

  # BAMOE Management Console
  bamoe-management-console:
    image: quay.io/bamoe/management-console:9.3.0-ibm-0007
    ports: ["9280:8080"]
    environment:
      RUNTIME_TOOLS_MANAGEMENT_CONSOLE_MANAGED_BUSINESS_SERVICES: >-
        [{"name": "Quarkus BAMOE App", "businessServiceUrl": "http://localhost:8080"}]

  # Kafka (Optional)
  kafka:
    image: quay.io/strimzi/kafka:0.39.0-kafka-3.6.0
    ports: ["9092:9092"]
    depends_on: [zookeeper]
```

## 🔐 Keycloak RBAC Setup

### Automated Realm Configuration
```bash
# Keycloak setup via Docker Compose
keycloak-rbac-setup:
  image: alpine:latest
  depends_on:
    keycloak:
      condition: service_healthy
  volumes:
    - ./docker/keycloak:/scripts
  command: >
    sh -c "
      apk add --no-cache curl jq &&
      /scripts/docker-setup.sh
    "
```

### RBAC Configuration (kogito-rbac.txt)
```text
# Clients
client:quarkus-bamoe-app:quarkus-bamoe-secret:Quarkus BAMOE Application
public-client:bamoe-management-console:BAMOE Management Console

# Roles
role:admin
role:manager
role:user

# Groups and Roles
group:Admins:admin
group:Managers:manager
group:Users:user

# Users
user:admin:admin@example.com:Admin:User:admin123:Admins
user:manager1:manager1@example.com:Manager:One:manager123:Managers
user:user1:user1@example.com:User:One:user123:Users
```

## 📝 Environment Configuration

### .env Template
```bash
# BAMOE Versions
BAMOE_VERSION=9.3.0-ibm-0007
QUARKUS_VERSION=3.20.1

# Database
DB_NAME=enquiry-process
DB_USER=quarkus
DB_PASSWORD=quarkus
DB_HOST=localhost
DB_PORT=5432

# OIDC Configuration
OIDC_AUTH_SERVER_URL=http://localhost:9180/realms/quarkus-realm
OIDC_CLIENT_ID=quarkus-bamoe-app
OIDC_CLIENT_SECRET=quarkus-bamoe-secret

# Service Ports
KOGITO_SERVICE_PORT=8080
MANAGEMENT_CONSOLE_PORT=9280
KEYCLOAK_PORT=9180
MAVEN_REPO_PORT=9080

# External Services (if applicable)
EXTERNAL_SERVICE_URL=http://external-api:8080
```

## 🧪 API Testing

### Get Authentication Token
```bash
TOKEN=$(curl -s -X POST "http://localhost:9180/realms/quarkus-realm/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin" \
  -d "password=admin123" \
  -d "grant_type=password" \
  -d "client_id=quarkus-bamoe-app" \
  -d "client_secret=quarkus-bamoe-secret" | jq -r '.access_token')
```

### Test Process API
```bash
# Create process
curl -X POST "http://localhost:8080/EnquiryProcess" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enquiry": {"title": "Test", "description": "Test process"}}'

# Get processes
curl -H "Authorization: Bearer $TOKEN" "http://localhost:8080/EnquiryProcess"
```

## 🏗️ Model Pattern

### Date Serialization Pattern
```java
public class Enquiry implements Serializable {
    private static final long serialVersionUID = 1L;
    
    @JsonProperty("createdAt")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private LocalDateTime createdAt;  // No @JsonFormat - use global config
}
```

### REST Client with Token Propagation
```java
@RegisterRestClient(configKey = "external-service")
@RegisterProvider(OidcClientRequestFilter.class)
public interface ExternalService {
    @GET List<Data> getData();
}
```

## 🔍 Key Solutions

**Date Serialization Issue**: Management Console JavaScript errors fixed with:
- Global Jackson config: `quarkus.jackson.write-dates-as-timestamps=false`
- Remove `@JsonFormat` annotations from models
- Use protobuf for persistence + Jackson for JSON APIs

**OIDC Integration**: Complete security with Keycloak realm auto-setup

**BAMOE Ecosystem**: Full Docker Compose stack with health checks and dependencies

---
**Template Repository**: Ready-to-clone BAMOE 9.3 application template

### BPMN Process Definition

The application includes a comprehensive BPMN process definition (`BusinessProcess.bpmn`):

1. **Start Event**: Process initiation
2. **Validate Case**: Input validation
3. **Gateway**: Decision point for case validity
4. **Process Case**: Business logic execution
5. **Reject Case**: Handle invalid cases
6. **End Event**: Process completion

### Process Variables

- **businessCase**: Main process variable containing case data
- **validationResult**: Result of case validation
- **processingResult**: Result of case processing

### Process Management

#### Starting a Process

```bash
# Start process instance via REST
curl -X POST http://localhost:8080/BusinessProcess \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "businessCase": {
      "caseId": "CASE-001",
      "caseType": "BUSINESS_PROCESS",
      "priority": "HIGH",
      "status": "NEW"
    }
  }'
```

#### Monitoring Processes

- **GraphQL UI**: http://localhost:8080/q/graphql-ui
- **Process Instances**: Query active and completed processes
- **Process History**: View process execution history

## Development

### Project Structure

```
src/
├── main/
│   ├── java/
│   │   └── com/example/bamoe/
│   │       ├── model/           # Data models
│   │       ├── service/         # Business services
│   │       ├── clients/         # REST clients
│   │       ├── util/            # Utilities
│   │       └── BusinessProcessResource.java
│   ├── resources/
│   │   ├── application.properties
│   │   └── BusinessProcess.bpmn
│   └── docker/
│       └── Dockerfile.jvm
├── test/                        # Test files
docker/                          # Docker configuration
│   ├── postgres/               # PostgreSQL initialization
│   └── keycloak/               # Keycloak RBAC configuration
docker-compose.yml              # Container orchestration
pom.xml                         # Maven configuration
```

### Development Commands

```bash
# Run in development mode
./mvnw quarkus:dev

# Run with local profile (security disabled)
./mvnw quarkus:dev -Plocal

# Run tests
./mvnw test

# Package application
./mvnw package

# Build native image
./mvnw package -Pnative
```

### Adding New Features

1. **Data Models**: Add to `src/main/java/com/example/bamoe/model/`
2. **Services**: Add to `src/main/java/com/example/bamoe/service/`
3. **REST Endpoints**: Add to `BusinessProcessResource.java`
4. **BPMN Processes**: Add to `src/main/resources/`
5. **Configuration**: Update `application.properties`

## Deployment

### Docker Deployment

```bash
# Build application
./mvnw package

# Build Docker image
docker build -f src/main/docker/Dockerfile.jvm -t quarkus-bamoe-app .

# Run with Docker Compose
docker-compose --profile container up -d
```

### Kubernetes Deployment

```bash
# Generate Kubernetes manifests
./mvnw quarkus:kubernetes

# Apply to cluster
kubectl apply -f target/kubernetes/
```

### Production Considerations

1. **Security**: Enable production security mode
2. **Database**: Use production-grade database
3. **Monitoring**: Configure proper monitoring
4. **Scaling**: Configure horizontal scaling
5. **Backup**: Implement backup strategies

## Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check port usage
lsof -i :8080
lsof -i :5432
lsof -i :9092

# Change ports in .env file
nano .env
```

#### Database Connection Issues
```bash
# Check database status
docker-compose logs postgres

# Test connection
curl http://localhost:8080/q/health/ready
```

#### Authentication Issues
```bash
# Check Keycloak status
curl http://localhost:8080/realms/quarkus-realm

# Verify RBAC setup
./docker/keycloak/setup-rbac.sh info

# Regenerate tokens
./docker/keycloak/setup-rbac.sh token admin admin123
```

#### Application Startup Issues
```bash
# Check application logs
docker-compose logs quarkus-bamoe-app

# Verify all services
docker-compose ps

# Check health endpoints
curl http://localhost:8080/q/health
```

### Logging Configuration

Enable debug logging for troubleshooting:

```properties
# Add to application.properties
quarkus.log.category."com.example.bamoe".level=DEBUG
quarkus.log.category."org.kie.kogito".level=DEBUG
quarkus.log.category."org.apache.kafka".level=DEBUG
```

### Performance Tuning

1. **JVM Settings**: Configure heap size and GC
2. **Database**: Optimize connection pools
3. **Kafka**: Tune consumer/producer settings
4. **Monitoring**: Use metrics for optimization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.

## Support

For support and questions:

- **Documentation**: Check this README and inline code comments
- **Issues**: Create GitHub issues for bugs and feature requests
- **Community**: Join the Quarkus community for general questions

---

## Quick Reference

### Essential Commands

```bash
# Start everything
docker-compose up -d && ./docker/keycloak/setup-rbac.sh setup

# Run application
./mvnw quarkus:dev

# Get token
./docker/keycloak/setup-rbac.sh token admin admin123

# Test API
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/business-process/health
```

### Key URLs

- **Application**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/q/swagger-ui
- **GraphQL UI**: http://localhost:8080/q/graphql-ui
- **Dev UI**: http://localhost:8080/q/dev
- **Health**: http://localhost:8080/q/health

Your Quarkus BAMOE application is now ready for development and production use! 🚀