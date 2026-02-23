import { NextRequest, NextResponse } from 'next/server';
import { syncProducts } from '@/lib/shoptet/products';
import { syncOrders } from '@/lib/shoptet/orders';
import { syncCustomers } from '@/lib/shoptet/customers';

/**
 * GET /api/shoptet/sync
 * Returns config status — is the Shoptet API configured?
 */
export async function GET() {
  const isConfigured = !!(
    process.env.SHOPTET_API_URL &&
    process.env.SHOPTET_API_TOKEN
  );
  const hasDb = !!(
    process.env.TURSO_DATABASE_URL &&
    process.env.TURSO_AUTH_TOKEN
  );

  return NextResponse.json({
    success: true,
    data: {
      shoptetConfigured: isConfigured,
      databaseConfigured: hasDb,
      shoptetApiUrl: process.env.SHOPTET_API_URL ? '✅ Nastaveno' : '❌ Chybí',
      shoptetApiToken: process.env.SHOPTET_API_TOKEN ? '✅ Nastaveno' : '❌ Chybí',
    },
  });
}

/**
 * POST /api/shoptet/sync
 * Triggers sync for specified type (products, orders, customers)
 * Body: { type: 'products' | 'orders' | 'customers' }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const syncType = body.type as string;

    if (!['products', 'orders', 'customers'].includes(syncType)) {
      return NextResponse.json(
        { success: false, error: 'Neplatný typ synchronizace. Povolené: products, orders, customers' },
        { status: 400 }
      );
    }

    const apiUrl = process.env.SHOPTET_API_URL;
    const apiToken = process.env.SHOPTET_API_TOKEN;

    if (!apiUrl || !apiToken) {
      return NextResponse.json(
        { success: false, error: 'Shoptet API není nakonfigurováno. Nastavte SHOPTET_API_URL a SHOPTET_API_TOKEN.' },
        { status: 400 }
      );
    }

    // Fetch data from Shoptet API
    const endpointMap: Record<string, string> = {
      products: '/api/products',
      orders: '/api/orders',
      customers: '/api/customers',
    };

    const response = await fetch(`${apiUrl}${endpointMap[syncType]}`, {
      headers: {
        'Shoptet-Access-Token': apiToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `Shoptet API vrátilo chybu: ${response.status} ${response.statusText}` },
        { status: 502 }
      );
    }

    const apiData = await response.json();
    const items = apiData.data?.[syncType] || apiData[syncType] || apiData.data || [];

    let count = 0;
    if (syncType === 'products') {
      count = await syncProducts(Array.isArray(items) ? items : []);
    } else if (syncType === 'orders') {
      count = await syncOrders(Array.isArray(items) ? items : []);
    } else if (syncType === 'customers') {
      count = await syncCustomers(Array.isArray(items) ? items : []);
    }

    return NextResponse.json({
      success: true,
      data: { type: syncType, itemsSynced: count },
    });
  } catch (error: unknown) {
    console.error('❌ Sync error:', error);
    const message = error instanceof Error ? error.message : 'Neznámá chyba';
    return NextResponse.json(
      { success: false, error: `Synchronizace selhala: ${message}` },
      { status: 500 }
    );
  }
}
