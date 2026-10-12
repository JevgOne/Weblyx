/**
 * Telegram Bot Notifications
 *
 * Sends instant notifications to Telegram when new leads arrive
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN?.trim();
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID?.trim();

import type { LeadConfiguration } from '@/lib/pricing/types';

interface LeadNotificationData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  projectType?: string;
  budget?: string;
  description?: string;
  leadId?: string;
  configuration?: LeadConfiguration | null;
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

// Telegram parses the message as HTML, so a stray "<" or "&" typed into a form
// would make the API reject the whole notification.
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const DIVIDER = '━━━━━━━━━━━━━━';

/**
 * Format lead data into pretty Telegram message
 */
function formatLeadMessage(lead: LeadNotificationData): string {
  // Trimmed: the production value ends in a newline, which broke the link below.
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://weblyx.cz';
  const adminUrl = `${baseUrl}/admin/leads`;

  // Three blocks — who, what they want, what they wrote — each under its own
  // heading, so the message can be read at a glance on a phone.
  let message = `🎯 <b>NOVÁ POPTÁVKA</b>\n${DIVIDER}\n\n`;

  message += '👤 <b>KONTAKT</b>\n';
  message += `Jméno: <b>${esc(lead.name)}</b>\n`;
  if (lead.phone) message += `📱 ${esc(lead.phone)}\n`;
  message += `📧 ${esc(lead.email)}\n`;
  if (lead.company) message += `🏢 ${esc(lead.company)}\n`;

  const project: string[] = [];

  if (lead.projectType) {
    const typeLabels: Record<string, string> = {
      'landing': 'Landing page',
      'website': 'Firemní web',
      'eshop': 'E-shop',
      'webapp': 'Webová aplikace',
      'redesign': 'Redesign',
      'other': 'Jiné'
    };
    project.push(`Typ: <b>${esc(typeLabels[lead.projectType] || lead.projectType)}</b>`);
  }

  if (lead.budget) {
    project.push(`💰 Rozpočet: <b>${esc(lead.budget)}</b>`);
  }

  if (lead.configuration) {
    const config = lead.configuration;
    project.push(`🧩 Balíček: <b>${esc(config.tierName)}</b>`);
    if (config.addons.length > 0) {
      project.push(`➕ Doplňky: ${esc(config.addons.map((a) => a.name).join(', '))}`);
    }
    let price = `💵 Cena: <b>${config.totalPrice.toLocaleString('cs-CZ')} Kč</b> · ${config.totalHours} h`;
    if (config.deliveryDays) price += ` · dodání ${config.deliveryDays} dní`;
    project.push(price);
  }

  if (project.length > 0) {
    message += `\n💼 <b>CO CHCE</b>\n${project.join('\n')}\n`;
  }

  if (lead.description) {
    message += `\n📝 <b>ZPRÁVA</b>\n<i>${esc(truncate(lead.description, 400))}</i>\n`;
  }

  message += `\n${DIVIDER}\n👉 <a href="${adminUrl}">Otevřít v adminu</a>`;

  return message;
}

/**
 * The message for a free audit run on the site. Same layout as an enquiry, so
 * the two are told apart by the first line and read the same way after it.
 */
export function formatAuditMessage(a: {
  host: string;
  url: string;
  email: string;
  name?: string | null;
  score?: number | null;
  missing: string[];
  failed?: boolean;
  adminUrl: string;
}): string {
  let message = `🔍 <b>NOVÝ AUDIT WEBU</b>\n${DIVIDER}\n\n`;

  message += '🌐 <b>WEB</b>\n';
  message += `<a href="${esc(a.url)}">${esc(a.host)}</a>\n`;
  if (a.failed) {
    message += '⚠️ Audit se nepodařilo dokončit (web možná nejede)\n';
  } else if (typeof a.score === 'number') {
    const light = a.score >= 80 ? '🟢' : a.score >= 50 ? '🟡' : '🔴';
    message += `${light} Skóre: <b>${a.score}/100</b>\n`;
  }

  message += '\n👤 <b>KONTAKT</b>\n';
  if (a.name) message += `Jméno: <b>${esc(a.name)}</b>\n`;
  message += `📧 ${esc(a.email)}\n`;

  if (a.missing.length > 0) {
    const shown = a.missing.slice(0, 8);
    message += `\n❌ <b>CO NA WEBU CHYBÍ (${a.missing.length})</b>\n`;
    message += shown.map((m) => `• ${esc(m)}`).join('\n') + '\n';
    if (a.missing.length > shown.length) message += `… a dalších ${a.missing.length - shown.length}\n`;
  }

  message += `\n${DIVIDER}\n👉 <a href="${a.adminUrl}">Otevřít audity</a>`;

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

/**
 * Sends a plain HTML-formatted message. For notifications that are not leads
 * (a free audit run on the site, for one) and so do not fit formatLeadMessage.
 */
export async function sendTelegramText(html: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return false;
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: html, parse_mode: 'HTML', disable_web_page_preview: true }),
    });
    const data = await response.json();
    if (!data.ok) console.error('❌ [Telegram] API error:', data.description);
    return Boolean(data.ok);
  } catch (error) {
    console.error('❌ [Telegram] send failed:', error);
    return false;
  }
}
