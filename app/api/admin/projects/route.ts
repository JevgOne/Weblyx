import { NextRequest, NextResponse } from "next/server";
import { turso } from "@/lib/turso";

export async function GET(request: NextRequest) {
  try {
    // Fetch all projects from Turso
    const result = await turso.execute(
      "SELECT * FROM projects ORDER BY created_at DESC"
    );

    const projects = result.rows.map((row: any) => {
      // Parse JSON fields
      const parseJSON = (field: any) => {
        if (!field) return null;
        try {
          return typeof field === 'string' ? JSON.parse(field) : field;
        } catch {
          return field;
        }
      };

      return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        longDescription: row.long_description,
        clientName: row.client_name,
        category: row.category,
        status: row.status,
        featuredImage: row.featured_image,
        gallery: parseJSON(row.gallery),
        technologies: parseJSON(row.technologies),
        features: parseJSON(row.features),
        url: row.url,
        githubUrl: row.github_url,
        isFeatured: row.is_featured === 1,
        order: row.order,
        viewCount: row.view_count,
        createdAt: row.created_at ? new Date(row.created_at * 1000).toISOString() : null,
        updatedAt: row.updated_at ? new Date(row.updated_at * 1000).toISOString() : null,
        deadline: row.deadline ? new Date(row.deadline * 1000).toISOString() : null,
      };
    });

    console.log(`✅ Fetched ${projects.length} projects from Turso`);

    return NextResponse.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
