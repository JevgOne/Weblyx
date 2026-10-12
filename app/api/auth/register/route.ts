import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { countPendingAdmins, createPendingAdmin } from '@/lib/auth/simple-auth';
import { sendTelegramText } from '@/lib/telegram';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const registerSchema = z.object({
  email: z.string()
    .email('Neplatný formát emailu')
    .min(5, 'Email musí mít alespoň 5 znaků')
    .max(100, 'Email je příliš dlouhý'),
  password: z.string()
    .min(8, 'Heslo musí mít alespoň 8 znaků')
    .max(100, 'Heslo je příliš dlouhé'),
  name: z.string()
    .min(2, 'Jméno musí mít alespoň 2 znaky')
    .max(50, 'Jméno je příliš dlouhé'),
});

// More waiting requests than this and the form closes until someone clears
// them; nobody can fill the table by posting in a loop.
const MAX_PENDING = 20;

/**
 * POST /api/auth/register
 * Ask to join the team. Creates an inactive account that cannot log in; it
 * starts working once an owner or admin approves it in Uživatelé and picks its
 * role. Registering never grants access by itself — it used to hand out an
 * owner or admin account to anyone.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    const { email, password, name } = validationResult.data;

    if ((await countPendingAdmins()) >= MAX_PENDING) {
      return NextResponse.json(
        { error: 'Registrace je dočasně pozastavená. Zkuste to prosím později.' },
        { status: 429 }
      );
    }

    await createPendingAdmin(email.trim().toLowerCase(), password, name.trim());

    // Never throws; the request is saved either way.
    await sendTelegramText(
      `👥 <b>ŽÁDOST O PŘÍSTUP DO ADMINU</b>\n\nJméno: <b>${esc(name.trim())}</b>\n📧 ${esc(email.trim().toLowerCase())}\n\n` +
        `Účet je neaktivní, dokud ho neschválíte.\n👉 <a href="https://www.weblyx.cz/admin/users">Otevřít Uživatele</a>`
    );

    return NextResponse.json({ success: true, pending: true });
  } catch (error: unknown) {
    console.error('❌ Registration error:', error);
    const message = error instanceof Error ? error.message : 'Chyba při registraci';

    if (message === 'Email already exists') {
      return NextResponse.json(
        { error: 'Účet nebo žádost s tímto e-mailem už existuje' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Chyba při registraci' },
      { status: 500 }
    );
  }
}
