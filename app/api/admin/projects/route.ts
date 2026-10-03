import { NextRequest, NextResponse } from "next/server";
import { listProjects } from "@/lib/turso/projects";
import { getAuthUser, unauthorizedResponse } from '@/lib/auth/require-auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return unauthorizedResponse();
    const projects = await listProjects();

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
      { success: false, error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
