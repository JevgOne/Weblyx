import { NextRequest, NextResponse } from 'next/server';
import { turso } from '@/lib/turso';
import { GoPay } from '@/lib/gopay';
import type { CreatePaymentInput } from '@/types/payments';

/**
 * POST /api/payments/create
 *
 * Create new payment via GoPay
 *
 * Body:
 * - amount: number (in CZK)
 * - description: string
 * - payment_type: 'project' | 'package' | 'deposit' | 'subscription' | 'manual'
 * - lead_id?: string
 * - payer_name?: string
 * - payer_email?: string
 * - payer_phone?: string
 * - return_url?: string (where to redirect after payment)
 *
 * Returns:
 * - payment: Payment object
 * - gw_url: GoPay gateway URL for redirect
 */
export async function POST(request: NextRequest) {
  try {
    const input: CreatePaymentInput = await request.json();

    // Validate required fields
    if (!input.amount || !input.description || !input.payment_type) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, description, payment_type' },
        { status: 400 }
      );
    }

    // Check GoPay configuration
    if (!GoPay.isConfigured()) {
      return NextResponse.json(
        { error: 'Payment gateway not configured' },
        { status: 500 }
      );
    }

    // Generate unique variable symbol
    const variableSymbol = GoPay.generateVariableSymbol();

    // Convert CZK to haléře
    const amountInHalere = GoPay.czkToHalere(input.amount);

    // Prepare return URLs
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://weblyx.cz';
    const returnUrl = input.return_url || `${siteUrl}/payments/success`;
    const notifyUrl = `${siteUrl}/api/payments/webhook`;

    // Create payment in GoPay
    const goPayResponse = await GoPay.createPayment({
      amount: amountInHalere,
      currency: 'CZK',
      order_number: variableSymbol,
      order_description: input.description,
      lang: 'cs',
      payer: input.payer_email ? {
        contact: {
          email: input.payer_email,
          first_name: input.payer_name?.split(' ')[0],
          last_name: input.payer_name?.split(' ').slice(1).join(' '),
          phone_number: input.payer_phone,
        },
      } : undefined,
      callback: {
        return_url: returnUrl,
        notification_url: notifyUrl,
      },
    });

    // Store payment in database
    await turso.execute({
      sql: `INSERT INTO payments (
        gopay_id, gopay_gw_url, gopay_status,
        lead_id, project_id,
        amount, currency, variable_symbol,
        description, payment_type,
        payer_name, payer_email, payer_phone, payer_ico, payer_dic,
        metadata, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        goPayResponse.id.toString(),
        goPayResponse.gw_url,
        goPayResponse.state,
        input.lead_id || null,
        input.project_id || null,
        amountInHalere,
        'CZK',
        variableSymbol,
        input.description,
        input.payment_type,
        input.payer_name || null,
        input.payer_email || null,
        input.payer_phone || null,
        input.payer_ico || null,
        input.payer_dic || null,
        input.metadata ? JSON.stringify(input.metadata) : null,
        input.notes || null,
      ],
    });

    console.log('✅ Payment created:', {
      gopay_id: goPayResponse.id,
      variable_symbol: variableSymbol,
      amount: `${input.amount} Kč`,
    });

    return NextResponse.json({
      success: true,
      payment: {
        gopay_id: goPayResponse.id,
        variable_symbol: variableSymbol,
        amount: amountInHalere,
        currency: 'CZK',
        status: goPayResponse.state,
      },
      gw_url: goPayResponse.gw_url,
    });

  } catch (error: any) {
    console.error('❌ Payment creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create payment',
      },
      { status: 500 }
    );
  }
}
