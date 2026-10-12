import { NextRequest, NextResponse } from 'next/server';
import { CLIENT_QUESTIONS, CLIENT_REQUIRED, answerText, isAnswered, type Answers } from '@/lib/consultation/questions';
import { saveClientAnswers } from '@/lib/consultation/store';
import { sendTelegramText } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * The client sends the short questionnaire they were given a link to.
 * The answers land in the same consultation staff see in the panel.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body.answers !== 'object' || body.answers === null) {
    return NextResponse.json({ success: false, error: 'Chybí data.' }, { status: 400 });
  }

  // Only what the client is asked, and only strings or lists of strings.
  const answers: Answers = {};
  for (const q of CLIENT_QUESTIONS) {
    const value = (body.answers as Record<string, unknown>)[q.id];
    if (Array.isArray(value)) answers[q.id] = value.map((v) => String(v).slice(0, 300)).slice(0, 40);
    else if (typeof value === 'string') answers[q.id] = value.slice(0, 5000);
  }
  const missing = CLIENT_REQUIRED.filter((id) => !isAnswered(answers[id]));
  if (missing.length) {
    return NextResponse.json({ success: false, error: 'Vyplňte prosím jméno, telefon a čím se zabýváte.' }, { status: 400 });
  }

  const saved = await saveClientAnswers(token, answers);
  if (!saved) return NextResponse.json({ success: false, error: 'Odkaz není platný.' }, { status: 404 });

  const line = (emoji: string, label: string, id: string) =>
    isAnswered(saved.answers[id]) ? `${emoji} <b>${label}:</b> ${esc(answerText(saved.answers[id]).replace(/\n+/g, ' / '))}` : null;
  const text = [
    '📝 <b>KLIENT VYPLNIL DOTAZNÍK</b>',
    '━━━━━━━━━━━━━━━',
    line('👤', 'Kdo', 'contactName'),
    line('🏢', 'Firma', 'company'),
    line('📞', 'Telefon', 'phone'),
    '',
    line('🧩', 'Balíček', 'budget'),
    line('➕', 'Funkce navíc', 'features'),
    line('📅', 'Termín', 'launch'),
    '',
    `👉 https://www.weblyx.cz/admin/konzultace/${saved.leadId}`,
  ].filter((l) => l !== null).join('\n');
  await sendTelegramText(text).catch(() => false);

  return NextResponse.json({ success: true });
}
