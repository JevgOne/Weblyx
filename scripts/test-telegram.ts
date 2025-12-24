#!/usr/bin/env tsx
/**
 * Test Telegram Notification
 *
 * Sends a test notification to verify Telegram bot is working
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { sendTestTelegramNotification } from '../lib/telegram';

async function testTelegram() {
  console.log('📱 Testing Telegram notification...\n');

  const success = await sendTestTelegramNotification();

  if (success) {
    console.log('\n✅ SUCCESS! Check your Telegram - you should have received a test notification!');
    console.log('📱 Bot is working correctly. New leads will automatically send notifications.\n');
  } else {
    console.log('\n❌ FAILED! Check:');
    console.log('1. TELEGRAM_BOT_TOKEN in .env.local');
    console.log('2. TELEGRAM_CHAT_ID in .env.local');
    console.log('3. Bot is not blocked by Telegram\n');
  }
}

testTelegram();
