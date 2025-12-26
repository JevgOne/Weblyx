#!/usr/bin/env tsx

/**
 * Test Telegram bot send to GROUP
 */

const TELEGRAM_BOT_TOKEN = '8505304862:AAGJ4OLh9Ddz3qPU35I6xOoa1cysBn8WJyE';
const TELEGRAM_CHAT_ID = '-5014512888'; // GROUP CHAT ID

async function testTelegramGroup() {
  console.log('🧪 Testing Telegram bot send to group...\n');
  console.log(`📱 Chat ID: ${TELEGRAM_CHAT_ID}`);
  console.log(`🤖 Bot Token: ${TELEGRAM_BOT_TOKEN.substring(0, 15)}...\n`);

  const message = `🧪 <b>TEST ZPRÁVA</b>

👤 Jméno: Test Lead
📧 Email: test@example.com
📱 Telefon: +420 777 888 999
🏢 Firma: Test s.r.o.

💼 Typ projektu: E-shop
💰 Rozpočet: 50 000 - 100 000 Kč

📝 Popis:
Testovací lead z Claudea - ověřuji že notifikace fungují správně.

Čas: ${new Date().toLocaleString('cs-CZ')}`;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      }
    );

    const data = await response.json();

    if (!data.ok) {
      console.error('❌ Telegram API error:', data);
      console.error('\n🔍 Error description:', data.description);

      if (data.description?.includes('chat not found')) {
        console.error('\n⚠️  Bot nenašel chat! Možná:');
        console.error('   1. Bot není přidaný do skupiny');
        console.error('   2. Špatné CHAT_ID');
        console.error('   3. Bot byl vyhozen ze skupiny');
      }

      return;
    }

    console.log('✅ Zpráva ÚSPĚŠNĚ odeslána do skupiny!');
    console.log('\n📊 Response:');
    console.log(JSON.stringify(data, null, 2));

  } catch (error: any) {
    console.error('❌ Network error:', error.message);
  }
}

testTelegramGroup();
