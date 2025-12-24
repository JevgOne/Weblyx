#!/usr/bin/env tsx
/**
 * Get Telegram Chat ID
 *
 * Fetches updates from Telegram bot to get user's chat ID
 */

const TELEGRAM_BOT_TOKEN = '8505304862:AAGJ4OLh9Ddz3qPU35I6xOoa1cysBn8WJyE';

async function getChatId() {
  console.log('📱 Fetching Telegram updates...\n');

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`
    );

    const data = await response.json();

    if (!data.ok) {
      console.error('❌ Error:', data.description);
      return;
    }

    if (data.result.length === 0) {
      console.log('⚠️  No messages found yet.');
      console.log('📝 Please send a message to your bot in Telegram (e.g., "/start" or "ahoj")');
      console.log('   Then run this script again.\n');
      return;
    }

    // Get the most recent message
    const latestUpdate = data.result[data.result.length - 1];
    const chatId = latestUpdate.message?.chat?.id;
    const username = latestUpdate.message?.from?.username || latestUpdate.message?.from?.first_name;

    if (chatId) {
      console.log('✅ Found your Chat ID!\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📱 CHAT_ID: ${chatId}`);
      console.log(`👤 User: ${username}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('💾 Add this to your .env.local:');
      console.log(`TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}`);
      console.log(`TELEGRAM_CHAT_ID=${chatId}\n`);
    } else {
      console.log('❌ Could not find chat ID in updates');
      console.log('📋 Raw updates:', JSON.stringify(data.result, null, 2));
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

getChatId();
