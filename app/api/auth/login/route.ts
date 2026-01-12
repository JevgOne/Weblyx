import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminCredentials, generateSessionToken } from '@/lib/auth/simple-auth';
import { cookies } from 'next/headers';
import { z } from 'zod';

// SECURITY: Input validation schema
const loginSchema = z.object({
  email: z.string()
    .email('Neplatný formát emailu')
    .min(5, 'Email musí mít alespoň 5 znaků')
    .max(100, 'Email je příliš dlouhý'),
  password: z.string()
    .min(8, 'Heslo musí mít alespoň 8 znaků')
    .max(100, 'Heslo je příliš dlouhé'),
});

// SECURITY: Rate limiting for login attempts
const loginAttempts = new Map<string, { count: number; resetTime: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes

function isLoginRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record || now > record.resetTime) {
    loginAttempts.set(ip, { count: 1, resetTime: now + LOGIN_RATE_LIMIT_WINDOW });
    return false;
  }

  if (record.count >= MAX_LOGIN_ATTEMPTS) {
    console.log(`🚫 [LOGIN RATE LIMIT] IP: ${ip} exceeded ${MAX_LOGIN_ATTEMPTS} attempts`);
    return true;
  }

  record.count++;
  return false;
}

/**
 * POST /api/auth/login
 * Admin login (NO Firebase - simple cookie auth)
 */
export async function POST(request: NextRequest) {
  try {
    // SECURITY: Check login rate limit
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    if (isLoginRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Příliš mnoho pokusů o přihlášení. Zkuste to za 15 minut.' },
        {
          status: 429,
          headers: {
            'Retry-After': '900', // 15 minutes in seconds
          }
        }
      );
    }

    const body = await request.json();

    // SECURITY: Validate input with Zod
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // Verify credentials
    const user = await verifyAdminCredentials(email, password);

    if (!user) {
      // SECURITY: Log failed login attempt
      console.warn(`🔐 [FAILED LOGIN] Email: ${email} | IP: ${ip} | Time: ${new Date().toISOString()}`);
      return NextResponse.json(
        { error: 'Nesprávný email nebo heslo' },
        { status: 401 }
      );
    }

    // Generate signed session token with user data
    const sessionToken = generateSessionToken(user);

    // Set secure cookie
    const cookieStore = await cookies();
    cookieStore.set('admin-session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', // SECURITY: Changed from 'lax' to 'strict' for maximum CSRF protection
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // SECURITY: Log successful login
    console.log(`✅ [SUCCESSFUL LOGIN] Email: ${user.email} | IP: ${ip} | Time: ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: any) {
    console.error('❌ Login error:', error);
    return NextResponse.json(
      { error: 'Chyba při přihlašování' },
      { status: 500 }
    );
  }
}
