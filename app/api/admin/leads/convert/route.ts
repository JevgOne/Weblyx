import { NextRequest, NextResponse } from 'next/server';
import { turso } from '@/lib/turso';
import { verifySessionToken } from '@/lib/auth/simple-auth';
import { cookies } from 'next/headers';

// Helper to get admin user by ID
function getAdminById(adminId: string): { id: string; email: string; name: string } | null {
  const ADMIN_USERS = [
    { id: 'admin-1', email: 'admin@weblyx.cz', name: 'Admin' },
    { id: 'admin-2', email: 'zvin.a@seznam.cz', name: 'Zen' },
    { id: 'admin-3', email: 'filip@weblyx.com', name: 'Filip' },
  ];

  return ADMIN_USERS.find(u => u.id === adminId) || null;
}

/**
 * POST /api/admin/leads/convert
 * Convert lead to project and assign to specified admin
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin-session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = verifySessionToken(sessionToken);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const { leadId, adminId } = await request.json();

    if (!leadId) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    // Use provided adminId or current user's ID
    const targetAdminId = adminId || user.id;

    // Validate that target admin exists
    const targetAdmin = getAdminById(targetAdminId);
    if (!targetAdmin) {
      return NextResponse.json(
        { error: 'Invalid admin ID - admin does not exist' },
        { status: 400 }
      );
    }

    // Get lead from database
    const leadResult = await turso.execute({
      sql: 'SELECT * FROM leads WHERE id = ?',
      args: [leadId],
    });

    if (leadResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    const lead = leadResult.rows[0];

    // Parse JSON fields
    const parseJSON = (field: any) => {
      if (!field) return null;
      try {
        return typeof field === 'string' ? JSON.parse(field) : field;
      } catch {
        return field;
      }
    };

    const projectDetails = parseJSON(lead.project_details);
    const features = parseJSON(lead.features);

    // Generate unique project ID
    const projectId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create project from lead data
    const now = Math.floor(Date.now() / 1000);

    await turso.execute({
      sql: `INSERT INTO projects (
        id, name, description,
        client_name, client_email, client_phone,
        status, priority, budget,
        tags,
        assigned_to,
        progress,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        projectId,
        lead.company || lead.name, // name
        lead.business_description || 'Poptávka z webu', // description
        lead.name, // client_name
        lead.email, // client_email
        lead.phone || null, // client_phone
        'in-progress', // status
        'medium', // priority
        null, // budget (parse from budget_range later if needed)
        JSON.stringify([lead.project_type || 'Web']), // tags
        targetAdminId, // assigned_to
        0, // progress
        now, // created_at
        now, // updated_at
      ],
    });

    // Update lead status to 'converted'
    await turso.execute({
      sql: `UPDATE leads
            SET status = 'converted',
                updated_at = unixepoch()
            WHERE id = ?`,
      args: [leadId],
    });

    console.log(`✅ Lead ${leadId} converted to project ${projectId} and assigned to ${targetAdmin.email}`);

    return NextResponse.json({
      success: true,
      project: {
        id: projectId,
        assignedTo: targetAdmin,
      },
    });

  } catch (error: any) {
    console.error('Error converting lead to project:', error);
    return NextResponse.json(
      { error: 'Failed to convert lead to project' },
      { status: 500 }
    );
  }
}
