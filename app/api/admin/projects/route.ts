import { NextRequest, NextResponse } from "next/server";
import { turso } from "@/lib/turso";

// Helper to get admin user by ID
async function getAdminById(adminId: string): Promise<{ id: string; email: string; name: string } | null> {
  const ADMIN_USERS = [
    { id: 'admin-1', email: 'admin@weblyx.cz', name: 'Admin' },
    { id: 'admin-2', email: 'zvin.a@seznam.cz', name: 'Admin 2' },
    { id: 'admin-3', email: 'filip@weblyx.com', name: 'Filip' },
  ];

  return ADMIN_USERS.find(u => u.id === adminId) || null;
}

export async function GET(request: NextRequest) {
  try {
    // Fetch all projects from Turso
    const result = await turso.execute(
      "SELECT * FROM projects ORDER BY created_at DESC"
    );

    const projects = await Promise.all(result.rows.map(async (row: any) => {
      // Parse JSON fields
      const parseJSON = (field: any) => {
        if (!field) return null;
        try {
          return typeof field === 'string' ? JSON.parse(field) : field;
        } catch {
          return field;
        }
      };

      // Get assigned admin info
      let assignedAdmin = null;
      if (row.assigned_to) {
        assignedAdmin = await getAdminById(row.assigned_to);
      }

      return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        longDescription: row.long_description,
        clientName: row.client_name,
        clientEmail: row.client_email,
        clientPhone: row.client_phone,
        category: row.category,
        status: row.status,
        priority: row.priority,
        budget: row.budget,
        progress: row.progress,
        featuredImage: row.featured_image,
        gallery: parseJSON(row.gallery),
        technologies: parseJSON(row.technologies),
        features: parseJSON(row.features),
        tags: parseJSON(row.tags),
        url: row.url,
        githubUrl: row.github_url,
        isFeatured: row.is_featured === 1,
        order: row.order,
        viewCount: row.view_count,
        assignedTo: assignedAdmin,
        createdAt: row.created_at ? new Date(row.created_at * 1000).toISOString() : null,
        updatedAt: row.updated_at ? new Date(row.updated_at * 1000).toISOString() : null,
        startDate: row.start_date ? new Date(row.start_date * 1000).toISOString() : null,
        deadline: row.deadline ? new Date(row.deadline * 1000).toISOString() : null,
        completionDate: row.completion_date ? new Date(row.completion_date * 1000).toISOString() : null,
        priceTotal: row.budget || 0,
        pricePaid: 0, // TODO: Add payment tracking
        projectNumber: `WBX-${new Date(row.created_at * 1000).getFullYear()}-${String(row.id).slice(-4)}`,
        projectType: row.category || 'Web',
      };
    }));

    console.log(`✅ Fetched ${projects.length} projects from Turso`);

    return NextResponse.json({
      success: true,
      data: projects,
    }, {
      headers: {
        'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
