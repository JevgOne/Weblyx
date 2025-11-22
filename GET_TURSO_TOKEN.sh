#!/bin/bash

echo "🔐 Turso Setup - Get Auth Token"
echo "================================"
echo ""

# Check if logged in
if ! turso auth whoami &> /dev/null; then
    echo "❌ Not logged in to Turso"
    echo ""
    echo "Please run in a NEW terminal window:"
    echo ""
    echo "  turso auth login"
    echo ""
    echo "After login, run this script again."
    exit 1
fi

echo "✅ Logged in to Turso as: $(turso auth whoami)"
echo ""

# Get database URL
echo "📍 Database URL:"
DB_URL=$(turso db show titanboxing --url 2>/dev/null)
if [ -z "$DB_URL" ]; then
    echo "❌ Database 'titanboxing' not found"
    echo ""
    echo "Creating database..."
    turso db create titanboxing --location ams
    DB_URL=$(turso db show titanboxing --url)
fi
echo "   $DB_URL"
echo ""

# Generate token
echo "🔑 Generating auth token..."
AUTH_TOKEN=$(turso db tokens create titanboxing)
echo ""

# Update .env.local
echo "📝 Updating .env.local..."
sed -i.backup "s|TURSO_AUTH_TOKEN=.*|TURSO_AUTH_TOKEN=$AUTH_TOKEN|" .env.local
rm -f .env.local.backup
echo ""

echo "✅ Done! Your .env.local has been updated."
echo ""
echo "🚀 Next step: Apply SQL schema"
echo ""
echo "  turso db shell titanboxing < turso-schema.sql"
echo ""
echo "Then run:"
echo "  npm run dev"
echo ""
