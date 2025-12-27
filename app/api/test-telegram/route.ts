import { NextResponse } from 'next/server';
import { sendTelegramNotification } from '@/lib/telegram';

/**
 * Test endpoint to check if Telegram notifications work
 * GET /api/test-telegram
 */
export async function GET() {
  console.log('🧪 [Test] Testing Telegram notification...');

  try {
    const result = await sendTelegramNotification({
      name: 'TEST from API endpoint',
      email: 'test@example.com',
      phone: '+420 777 888 999',
      company: 'Test Company',
      projectType: 'eshop',
      budget: '50 000 - 100 000 Kč',
      description: 'Test zpráva z API endpointu pro ověření že Telegram funguje',
      leadId: 'test-123',
    });

    console.log('🧪 [Test] Result:', result);

    return NextResponse.json({
      success: result,
      message: result
        ? 'Telegram notification sent successfully!'
        : 'Telegram notification failed - check logs',
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('🧪 [Test] Error:', error);

    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
