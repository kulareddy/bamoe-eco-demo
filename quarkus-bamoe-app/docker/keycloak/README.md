# Keycloak RBAC Configuration for Quarkus BAMOE

This directory contains the Keycloak RBAC (Role-Based Access Control) configuration for the Quarkus BAMOE application.

## Files

- `kogito-rbac.txt` - RBAC configuration file defining roles, groups, users, and clients
- `setup-rbac.sh` - Script to set up Keycloak with the RBAC configuration

## Quick Start

1. **Start Keycloak** (using Docker Compose):
   ```bash
   docker-compose up keycloak -d
   ```

2. **Wait for Keycloak to be ready**:
   ```bash
   # From project root
   ./docker/keycloak/setup-rbac.sh wait
   
   # Or from keycloak directory
   cd docker/keycloak && ./setup-rbac.sh wait
   ```

3. **Set up RBAC**:
   ```bash
   # From project root
   ./docker/keycloak/setup-rbac.sh setup
   
   # Or from keycloak directory
   cd docker/keycloak && ./setup-rbac.sh setup
   ```

4. **Get test tokens**:
   ```bash
   # Backend service token
   ./docker/keycloak/setup-rbac.sh token admin admin123
   
   # Process token
   ./docker/keycloak/setup-rbac.sh token admin admin123 process
   
   # Or from keycloak directory
   cd docker/keycloak && ./setup-rbac.sh token admin admin123
   ```

## Configuration

### Clients

- **quarkus-bamoe-app** (Confidential) - Backend service with service account
- **quarkus-bamoe-frontend** (Public) - Frontend application

### Roles

- **admin** - Full administrative access
- **manager** - Management level access
- **user** - Standard user access
- **analyst** - Read-only analytical access

### Groups

- **Admins** - Users with admin role
- **Managers** - Users with manager role
- **Users** - Users with user role
- **Analysts** - Users with analyst role

### Test Users

- **admin** / admin123 - Admin user
- **manager1** / manager123 - Manager user
- **user1** / user123 - Regular user
- **analyst1** / analyst123 - Analyst user

## Environment Variables

The script reads from `.env` file or environment variables:

- `KEYCLOAK_URL` - Keycloak server URL (default: http://localhost:8080)
- `KEYCLOAK_REALM_NAME` - Realm name (default: quarkus-realm)
- `KEYCLOAK_ADMIN` - Admin username (default: admin)
- `KEYCLOAK_ADMIN_PASSWORD` - Admin password (default: admin123)

## Script Commands

- `wait` - Wait for Keycloak to be ready
- `setup` - Set up RBAC configuration
- `check-clients` - Check and restore missing clients
- `token <username> <password> [type]` - Get test token
- `info` - Show configuration information
- `help` - Show usage information