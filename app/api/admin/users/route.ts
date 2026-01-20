import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import {
  verifySessionToken,
  getAllDbAdmins,
  createDbAdmin,
  AdminUser,
} from '@/lib/auth/simple-auth';

// Validation schema for creating admin
const createAdminSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .min(5, 'Email must be at least 5 characters')
    .max(100, 'Email is too long'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long'),
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name is too long'),
  role: z.enum(['super_admin', 'admin']).optional().default('admin'),
});

/**
 * Verify current user is authenticated and is super_admin
 */
async function verifyAuth(requireSuperAdmin = false): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin-session')?.value;

  if (!sessionToken) {
    return null;
  }

  const user = verifySessionToken(sessionToken);

  if (!user) {
    return null;
  }

  // For now, allow all authenticated admins to manage users
  // In production, you might want to restrict to super_admin only
  if (requireSuperAdmin && user.role !== 'super_admin') {
    return null;
  }

  return user;
}

/**
 * GET /api/admin/users
 * List all admin users
 */
export async function GET(request: NextRequest) {
  try {
    const currentUser = await verifyAuth();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const admins = await getAllDbAdmins();

    // Don't return password_hash
    const safeAdmins = admins.map(admin => ({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role || 'admin',
      active: admin.active,
      created_at: admin.created_at,
    }));

    return NextResponse.json({ admins: safeAdmins });
  } catch (error: any) {
    console.error('Error fetching admins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admins' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users
 * Create new admin user
 */
export async function POST(request: NextRequest) {
  try {
    const currentUser = await verifyAuth();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validationResult = createAdminSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    const { email, password, name, role } = validationResult.data;

    // Create new admin
    const newAdmin = await createDbAdmin(email, password, name, role);

    if (!newAdmin) {
      return NextResponse.json(
        { error: 'Failed to create admin' },
        { status: 500 }
      );
    }

    console.log(`✅ [ADMIN CREATED] Email: ${email} by ${currentUser.email}`);

    return NextResponse.json({
      success: true,
      admin: {
        id: newAdmin.id,
        email: newAdmin.email,
        name: newAdmin.name,
        role: newAdmin.role,
        active: newAdmin.active,
        created_at: newAdmin.created_at,
      },
    });
  } catch (error: any) {
    console.error('Error creating admin:', error);

    if (error.message === 'Email already exists') {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create admin' },
      { status: 500 }
    );
  }
}
