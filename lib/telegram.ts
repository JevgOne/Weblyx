/**
 * Telegram Bot Notifications
 *
 * Sends instant notifications to Telegram when new leads arrive
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

interface LeadNotificationData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  projectType?: string;
  budget?: string;
  description?: string;
  leadId?: string;
}

/**
 * Send notification to Telegram
 */
export async function sendTelegramNotification(
  leadData: LeadNotificationData
): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('⚠️ Telegram credentials not configured. Skipping notification.');
    console.warn('⚠️ TELEGRAM_BOT_TOKEN:', TELEGRAM_BOT_TOKEN ? 'SET' : 'MISSING');
    console.warn('⚠️ TELEGRAM_CHAT_ID:', TELEGRAM_CHAT_ID ? 'SET' : 'MISSING');
    return false;
  }

  try {
    const message = formatLeadMessage(leadData);

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
      console.error('❌ [Telegram] API error:', data.description);
      console.error('❌ [Telegram] Full error:', JSON.stringify(data));
      return false;
    }

    return true;

  } catch (error: any) {
    console.error('❌ [Telegram] Network/Parse error:', error.message);
    console.error('❌ [Telegram] Stack:', error.stack);
    return false;
  }
}

/**
 * Format lead data into pretty Telegram message
 */
function formatLeadMessage(lead: LeadNotificationData): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://weblyx.cz';
  const adminUrl = `${baseUrl}/admin/leads`;

  let message = '🎯 <b>NOVÝ LEAD!</b>\n\n';

  // Contact info
  message += `👤 <b>Jméno:</b> ${lead.name}\n`;
  message += `📧 <b>Email:</b> ${lead.email}\n`;

  if (lead.phone) {
    message += `📱 <b>Telefon:</b> ${lead.phone}\n`;
  }

  if (lead.company) {
    message += `🏢 <b>Firma:</b> ${lead.company}\n`;
  }

  message += '\n';

  // Project details
  if (lead.projectType) {
    const typeLabels: Record<string, string> = {
      'landing': 'Landing page',
      'website': 'Firemní web',
      'eshop': 'E-shop',
      'webapp': 'Webová aplikace',
      'redesign': 'Redesign',
      'other': 'Jiné'
    };
    message += `💼 <b>Typ projektu:</b> ${typeLabels[lead.projectType] || lead.projectType}\n`;
  }

  if (lead.budget) {
    message += `💰 <b>Rozpočet:</b> ${lead.budget}\n`;
  }

  if (lead.description) {
    message += `\n📝 <b>Popis:</b>\n${truncate(lead.description, 200)}\n`;
  }

  message += `\n👉 <a href="${adminUrl}">Zobrazit v admin panelu</a>`;

  return message;
}

/**
 * Truncate text to specified length
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Send test notification
 */
export async function sendTestTelegramNotification(): Promise<boolean> {
  return sendTelegramNotification({
    name: 'Jan Novák (TEST)',
    email: 'jan.novak@example.com',
    phone: '+420 777 888 999',
    company: 'Test s.r.o.',
    projectType: 'eshop',
    budget: '50 000 - 100 000 Kč',
    description: 'Testovací poptávka - chci modernizovat existující e-shop a přidat nové funkce pro zákazníky.',
  });
}
