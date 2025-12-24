#!/bin/bash
# Test Invoice API via HTTP

echo "🧪 Testing invoice generation API..."
echo ""

# Start Next.js dev server in background if not running
if ! lsof -ti:3000 > /dev/null 2>&1; then
  echo "⚠️  Dev server not running. Please start it first:"
  echo "   npm run dev"
  exit 1
fi

# Test data
curl -X POST http://localhost:3000/api/invoices/generate \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "Test Client s.r.o.",
    "client_email": "test@example.com",
    "client_street": "Testovací 123",
    "client_city": "Praha",
    "client_zip": "110 00",
    "client_ico": "12345678",
    "client_dic": "CZ12345678",
    "invoice_type": "standard",
    "payment_method": "bank_transfer",
    "due_days": 14,
    "items": [
      {
        "description": "Vývoj webových stránek - E-commerce",
        "quantity": 1,
        "unit_price": 5000000,
        "vat_rate": 21
      },
      {
        "description": "SEO optimalizace",
        "quantity": 3,
        "unit_price": 500000,
        "vat_rate": 21
      }
    ],
    "notes": "Testovací faktura - prosím nezapomeňte uvést variabilní symbol při platbě."
  }' | jq .

echo ""
echo "✨ Test completed!"
