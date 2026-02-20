import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import {
  verifySessionToken,
  getDbAdminById,
  updateDbAdmin,
  deleteDbAdmin,
  AdminUser,
} from '@/lib/auth/simple-auth';
import { isOwner } from '@/lib/auth/permissions';
import { logActivity } from '@/lib/activity-log';

// Validation schema for updating admin
const updateAdminSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .min(5, 'Email must be at least 5 characters')
    .max(100, 'Email is too long')
    .optional(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long')
    .optional(),
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name is too long')
    .optional(),
  role: z.enum(['owner', 'admin', 'specialist']).optional(),
  active: z.boolean().optional(),
});

/**
 * Verify current user is authenticated
 */
async function verifyAuth(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin-session')?.value;

  if (!sessionToken) {
    return null;
  }

  return verifySessionToken(sessionToken);
}

/**
 * GET /api/admin/users/[id]
 * Get single admin user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await verifyAuth();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const admin = await getDbAdminById(id);

    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role || 'admin',
        active: admin.active,
        created_at: admin.created_at,
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/users/[id]
 * Update admin user
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await verifyAuth();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validationResult = updateAdminSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Check if admin exists
    const existingAdmin = await getDbAdminById(id);
    if (!existingAdmin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    // Prevent deactivating yourself
    if (updateData.active === false && id === currentUser.id) {
      return NextResponse.json(
        { error: 'Cannot deactivate yourself' },
        { status: 400 }
      );
    }

    const success = await updateDbAdmin(id, updateData);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update admin' },
        { status: 500 }
      );
    }

    // Log activity
    const changes = Object.keys(updateData).filter(k => k !== 'password').join(', ');
    await logActivity({
      userId: currentUser.id,
      userEmail: currentUser.email,
      userName: currentUser.name,
      action: 'user_updated',
      entityType: 'user',
      entityId: id,
      entityName: `${existingAdmin.name} (${existingAdmin.email})`,
      details: changes ? `Změněno: ${changes}` : undefined,
    });

    // Fetch updated admin
    const updatedAdmin = await getDbAdminById(id);

    return NextResponse.json({
      success: true,
      admin: updatedAdmin ? {
        id: updatedAdmin.id,
        email: updatedAdmin.email,
        name: updatedAdmin.name,
        role: updatedAdmin.role || 'admin',
        active: updatedAdmin.active,
        created_at: updatedAdmin.created_at,
      } : null,
    });
  } catch (error: any) {
    console.error('Error updating admin:', error);
    return NextResponse.json(
      { error: 'Failed to update admin' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Soft delete admin user (deactivate)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await verifyAuth();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only owner can delete users
    if (!isOwner(currentUser.role)) {
      return NextResponse.json(
        { error: 'Only owner can delete users' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Prevent deleting yourself
    if (id === currentUser.id) {
      return NextResponse.json(
        { error: 'Cannot delete yourself' },
        { status: 400 }
      );
    }

    // Check if admin exists
    const existingAdmin = await getDbAdminById(id);
    if (!existingAdmin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    const success = await deleteDbAdmin(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete admin' },
        { status: 500 }
      );
    }

    // Log activity
    await logActivity({
      userId: currentUser.id,
      userEmail: currentUser.email,
      userName: currentUser.name,
      action: 'user_deleted',
      entityType: 'user',
      entityId: id,
      entityName: `${existingAdmin.name} (${existingAdmin.email})`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting admin:', error);
    return NextResponse.json(
      { error: 'Failed to delete admin' },
      { status: 500 }
    );
  }
}
