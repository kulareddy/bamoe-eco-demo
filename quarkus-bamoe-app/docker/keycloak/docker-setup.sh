#!/bin/sh

# Docker-friendly RBAC setup script
# This script is designed to run inside a Docker container

set -e

echo "🔐 Keycloak RBAC Docker Setup"
echo "=============================="

# Install bash for the setup script
echo "📦 Installing bash..."
apk add --no-cache bash

# Wait for Keycloak to be ready
echo "⏳ Waiting for Keycloak to be ready..."
until curl -f "${KEYCLOAK_URL}/realms/master" >/dev/null 2>&1; do
    echo "Keycloak not ready yet, waiting..."
    sleep 5
done

echo "✅ Keycloak is ready!"

# Run the RBAC setup
echo "🔐 Setting up RBAC..."
cd /scripts
bash ./setup-rbac.sh setup

echo "🎉 RBAC setup completed successfully!"
echo ""
echo "📋 Keycloak Information:"
echo "  Admin Console: ${KEYCLOAK_URL}/admin"
echo "  Admin User: ${KEYCLOAK_ADMIN}"
echo "  Admin Password: ${KEYCLOAK_ADMIN_PASSWORD}"
echo "  Realm: ${KEYCLOAK_REALM_NAME}"