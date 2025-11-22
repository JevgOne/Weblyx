#!/bin/bash

# Setup Turso Database for Weblyx
# This script creates the database and applies the schema

set -e

echo "🚀 Setting up Turso database..."

# Database name
DB_NAME="titanboxing"
DB_URL="libsql://titanboxing-jevgone.aws-ap-south-1.turso.io"

# Check if logged in
if ! turso auth whoami &> /dev/null; then
    echo "❌ Not logged in to Turso. Please run: turso auth login"
    exit 1
fi

echo "✅ Logged in to Turso"

# Check if database exists
if turso db show $DB_NAME &> /dev/null; then
    echo "✅ Database '$DB_NAME' already exists"
else
    echo "📦 Creating database '$DB_NAME'..."
    turso db create $DB_NAME --location ams
fi

# Get database URL
DB_URL=$(turso db show $DB_NAME --url)
echo "📍 Database URL: $DB_URL"

# Get auth token
echo "🔑 Generating auth token..."
AUTH_TOKEN=$(turso db tokens create $DB_NAME)

# Apply schema
echo "📝 Applying schema..."
turso db shell $DB_NAME < turso-schema.sql

echo ""
echo "✅ Turso setup complete!"
echo ""
echo "Add these to your .env.local file:"
echo ""
echo "TURSO_DATABASE_URL=$DB_URL"
echo "TURSO_AUTH_TOKEN=$AUTH_TOKEN"
echo ""
