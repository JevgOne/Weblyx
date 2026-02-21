import { NextRequest, NextResponse } from 'next/server';
import { searchClients, createClient } from '@/lib/turso/clients';
import type { CreateClientInput } from '@/types/payments';

/**
 * GET /api/clients?q=searchterm
 *
 * Search clients by name, ICO, or email.
 * Returns max 10 results.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (query.length < 1) {
      return NextResponse.json({ success: true, data: [] });
    }

    const clients = await searchClients(query);

    return NextResponse.json({ success: true, data: clients });
  } catch (error: any) {
    console.error('Error searching clients:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search clients' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/clients
 *
 * Create a new client.
 */
export async function POST(request: NextRequest) {
  try {
    const input: CreateClientInput = await request.json();

    if (!input.name) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: name' },
        { status: 400 }
      );
    }

    const client = await createClient(input);

    return NextResponse.json({ success: true, data: client });
  } catch (error: any) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create client' },
      { status: 500 }
    );
  }
}
