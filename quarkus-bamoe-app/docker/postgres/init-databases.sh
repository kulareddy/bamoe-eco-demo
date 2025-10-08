#!/bin/bash

# PostgreSQL initialization script that uses environment variables
# This script is called by docker-entrypoint.sh

set -e

# Get database and user info from environment variables
DB_NAME=${DB_NAME:-quarkus_bamoe}
DB_USER=${DB_USER:-quarkus}
ENQUIRY_DB_NAME=${ENQUIRY_DB_NAME:-enquiry-db}

echo "Initializing databases with:"
echo "  Main DB: $DB_NAME"
echo "  Enquiry DB: $ENQUIRY_DB_NAME"
echo "  User: $DB_USER"

# Create the enquiry database
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE "$ENQUIRY_DB_NAME";
    GRANT ALL PRIVILEGES ON DATABASE "$ENQUIRY_DB_NAME" TO "$DB_USER";
EOSQL

# Grant privileges on main database
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$DB_NAME" <<-EOSQL
    GRANT ALL ON SCHEMA public TO "$DB_USER";
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "$DB_USER";
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "$DB_USER";
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "$DB_USER";
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "$DB_USER";
EOSQL

# Grant privileges on enquiry database
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$ENQUIRY_DB_NAME" <<-EOSQL
    GRANT ALL ON SCHEMA public TO "$DB_USER";
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "$DB_USER";
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "$DB_USER";
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "$DB_USER";
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "$DB_USER";
EOSQL

echo "Database initialization completed successfully!"
echo "Main database: $DB_NAME"
echo "Enquiry database: $ENQUIRY_DB_NAME"
echo "User: $DB_USER has full access to all databases"