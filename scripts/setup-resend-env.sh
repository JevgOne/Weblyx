#!/bin/bash

# 📧 Resend Email Setup Script
# This script helps you add Resend API key to Vercel environment variables

echo "📧 Resend Email Setup for Weblyx"
echo "================================"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed"
    echo "Install it with: npm i -g vercel"
    exit 1
fi

echo "✅ Vercel CLI detected"
echo ""

# Ask for Resend API key
echo "🔑 Enter your Resend API key:"
echo "   (Get it from: https://resend.com/api-keys)"
read -r -p "   API Key: " RESEND_API_KEY

if [ -z "$RESEND_API_KEY" ]; then
    echo "❌ API key cannot be empty"
    exit 1
fi

# Validate API key format (should start with "re_")
if [[ ! "$RESEND_API_KEY" =~ ^re_ ]]; then
    echo "⚠️  Warning: API key should start with 're_'"
    echo "   Are you sure this is correct?"
    read -r -p "   Continue? (y/n): " confirm
    if [ "$confirm" != "y" ]; then
        exit 1
    fi
fi

echo ""
echo "📧 Enter the FROM email address:"
echo "   (e.g., noreply@weblyx.cz)"
read -r -p "   FROM Email: " RESEND_FROM_EMAIL

if [ -z "$RESEND_FROM_EMAIL" ]; then
    RESEND_FROM_EMAIL="noreply@weblyx.cz"
    echo "   Using default: $RESEND_FROM_EMAIL"
fi

echo ""
echo "🚀 Adding environment variables to Vercel..."
echo ""

# Add to production
echo "📦 Adding to PRODUCTION..."
echo "$RESEND_API_KEY" | vercel env add RESEND_API_KEY production
echo "$RESEND_FROM_EMAIL" | vercel env add RESEND_FROM_EMAIL production

# Add to preview
echo ""
echo "📦 Adding to PREVIEW..."
echo "$RESEND_API_KEY" | vercel env add RESEND_API_KEY preview
echo "$RESEND_FROM_EMAIL" | vercel env add RESEND_FROM_EMAIL preview

# Add to development
echo ""
echo "📦 Adding to DEVELOPMENT..."
echo "$RESEND_API_KEY" | vercel env add RESEND_API_KEY development
echo "$RESEND_FROM_EMAIL" | vercel env add RESEND_FROM_EMAIL development

echo ""
echo "✅ Environment variables added successfully!"
echo ""

# Pull env variables to local
echo "📥 Pulling environment variables to local .env file..."
vercel env pull

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Verify domain in Resend: https://resend.com/domains"
echo "2. Redeploy your project: vercel --prod"
echo "3. Test invoice email in admin panel"
echo ""
echo "📚 Full guide: /Users/zen/weblyx/RESEND_SETUP.md"
