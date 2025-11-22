import { NextResponse } from "next/server";
import { adminDbInstance } from "@/lib/firebase-admin";
import { turso } from "@/lib/turso";

export async function GET() {
  try {
    if (!adminDbInstance) {
      return NextResponse.json(
        { error: "Firebase Admin not initialized" },
        { status: 500 }
      );
    }

    // Fetch stats - Portfolio from Turso, rest from Firebase
    const [projectsSnap, leadsSnap, portfolioResult] = await Promise.all([
      adminDbInstance.collection("projects").count().get(),
      adminDbInstance.collection("leads").count().get(),
      turso.execute("SELECT COUNT(*) as count FROM portfolio"),
    ]);

    const stats = {
      projects: projectsSnap.data().count,
      leads: leadsSnap.data().count,
      portfolio: Number(portfolioResult.rows[0].count) || 0,
    };

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
