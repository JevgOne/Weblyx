/**
 * Direct Resend API test
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env.local') });

import { Resend } from 'resend';

async function testDirect() {
  const apiKey = process.env.RESEND_API_KEY;

  console.log('🔑 API Key loaded:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');
  console.log('');

  if (!apiKey) {
    console.error('❌ RESEND_API_KEY not found in environment');
    process.exit(1);
  }

  const resend = new Resend(apiKey);

  console.log('📧 Sending test email...');

  try {
    const result = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: 'delivered@resend.dev',
      subject: 'Test from Weblyx',
      html: '<p>This is a test email from Weblyx project.</p>',
    });

    console.log('✅ Success!');
    console.log('Result:', result);
  } catch (error: any) {
    console.error('❌ Failed!');
    console.error('Error:', error);
  }
}

testDirect();
