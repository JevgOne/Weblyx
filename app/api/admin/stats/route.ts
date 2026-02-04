import { NextResponse } from "next/server";
import { turso } from "@/lib/turso";

export async function GET() {
  try {
    // Fetch all stats from Turso
    const [projectsResult, leadsResult, portfolioResult] = await Promise.all([
      turso.execute("SELECT COUNT(*) as count FROM projects"),
      turso.execute("SELECT COUNT(*) as count FROM leads"),
      turso.execute("SELECT COUNT(*) as count FROM portfolio"),
    ]);

    const stats = {
      projects: Number(projectsResult.rows[0].count) || 0,
      leads: Number(leadsResult.rows[0].count) || 0,
      portfolio: Number(portfolioResult.rows[0].count) || 0,
    };

    return NextResponse.json({ success: true, data: stats }, {
      headers: {
        'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
