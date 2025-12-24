#!/bin/bash

# Test Telegram notification on production

echo "📱 Testing Telegram notification via production API..."
echo ""

curl -X POST https://weblyx.cz/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "projectType": "eshop",
    "companyName": "TEST Company (Telegram)",
    "businessDescription": "This is a TEST lead to verify Telegram notifications work on production.",
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+420 777 888 999",
    "budget": "50 000 - 100 000 Kč"
  }'

echo ""
echo ""
echo "✅ Request sent! Check:"
echo "1. Telegram for notification"
echo "2. Database for new lead"
echo "3. Email inbox"
