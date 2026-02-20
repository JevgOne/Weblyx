import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, hashPassword, comparePassword } from '@/lib/auth/simple-auth';
import { turso } from '@/lib/turso';

/**
 * POST /api/auth/change-password
 * Change admin password (stored in DB for runtime changes)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify user is logged in
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin-session');

    if (!sessionToken?.value) {
      return NextResponse.json(
        { error: 'Nepřihlášen' },
        { status: 401 }
      );
    }

    const user = verifySessionToken(sessionToken.value);
    if (!user) {
      return NextResponse.json(
        { error: 'Neplatná session' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Zadejte současné a nové heslo' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Nové heslo musí mít alespoň 8 znaků' },
        { status: 400 }
      );
    }

    // Get env password for this user
    const envPassword = user.id === 'admin-1'
      ? process.env.ADMIN_PASSWORD
      : process.env.ADMIN_PASSWORD_2;

    if (!envPassword) {
      return NextResponse.json(
        { error: 'Admin heslo není nakonfigurováno v prostředí' },
        { status: 500 }
      );
    }

    // Check if there's a hashed custom password in DB
    const customPasswordHash = await getCustomPassword(user.id);

    // Verify current password - check DB hash first, then env fallback
    let isCurrentPasswordValid = false;
    if (customPasswordHash) {
      isCurrentPasswordValid = await comparePassword(currentPassword, customPasswordHash);
    }
    if (!isCurrentPasswordValid) {
      // Fallback: check against env password (plaintext comparison for legacy)
      isCurrentPasswordValid = currentPassword === envPassword;
    }

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Nesprávné současné heslo' },
        { status: 400 }
      );
    }

    // Ensure table exists
    await ensureAdminSettingsTable();

    // Hash the new password before saving
    const hashedPassword = await hashPassword(newPassword);

    // Save hashed password to DB
    await turso.execute({
      sql: `
        INSERT INTO admin_settings (key, value, updated_at)
        VALUES (?, ?, datetime('now'))
        ON CONFLICT(key) DO UPDATE SET
          value = excluded.value,
          updated_at = datetime('now')
      `,
      args: [`password_${user.id}`, hashedPassword],
    });

    return NextResponse.json({
      success: true,
      message: 'Heslo bylo úspěšně změněno',
    });
  } catch (error: any) {
    console.error('❌ Change password error:', error);
    return NextResponse.json(
      { error: 'Chyba při změně hesla' },
      { status: 500 }
    );
  }
}

/**
 * Get custom password from DB if exists
 */
async function getCustomPassword(userId: string): Promise<string | null> {
  try {
    await ensureAdminSettingsTable();

    const result = await turso.execute({
      sql: 'SELECT value FROM admin_settings WHERE key = ?',
      args: [`password_${userId}`],
    });

    if (result.rows.length > 0) {
      return result.rows[0].value as string;
    }
    return null;
  } catch (error) {
    console.error('Error getting custom password:', error);
    return null;
  }
}

/**
 * Ensure admin_settings table exists
 */
async function ensureAdminSettingsTable() {
  await turso.execute({
    sql: `
      CREATE TABLE IF NOT EXISTS admin_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `,
    args: [],
  });
}

