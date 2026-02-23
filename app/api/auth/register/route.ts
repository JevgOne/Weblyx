import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createDbAdmin,
  hasAnyAdmins,
  generateSessionToken,
} from '@/lib/auth/simple-auth';
import { cookies } from 'next/headers';

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

/**
 * POST /api/auth/register
 * Register a new admin account.
 * First registered user gets "owner" role, subsequent get "admin" role.
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

    // First user becomes owner, others become admin
    const existingAdmins = await hasAnyAdmins();
    const role = existingAdmins ? 'admin' : 'owner';

    const newAdmin = await createDbAdmin(email, password, name, role);

    if (!newAdmin) {
      return NextResponse.json(
        { error: 'Nepodařilo se vytvořit účet' },
        { status: 500 }
      );
    }

    // Auto-login after registration
    const sessionToken = generateSessionToken({
      id: newAdmin.id,
      email: newAdmin.email,
      name: newAdmin.name,
      role: newAdmin.role,
    });

    const cookieStore = await cookies();
    cookieStore.set('admin-session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return NextResponse.json({
      success: true,
      user: {
        email: newAdmin.email,
        name: newAdmin.name,
        role: newAdmin.role,
      },
    });
  } catch (error: unknown) {
    console.error('❌ Registration error:', error);
    const message = error instanceof Error ? error.message : 'Chyba při registraci';

    if (message === 'Email already exists') {
      return NextResponse.json(
        { error: 'Účet s tímto emailem již existuje' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
