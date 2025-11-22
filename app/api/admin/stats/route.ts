import { NextResponse } from "next/server";
import { adminDbInstance } from "@/lib/firebase-admin";

export async function GET() {
  try {
    if (!adminDbInstance) {
      return NextResponse.json(
        { error: "Firebase Admin not initialized" },
        { status: 500 }
      );
    }

    // Parallel fetch all stats
    const [projectsSnap, leadsSnap, portfolioSnap] = await Promise.all([
      adminDbInstance.collection("projects").count().get(),
      adminDbInstance.collection("leads").count().get(),
      adminDbInstance.collection("portfolio").count().get(),
    ]);

    const stats = {
      projects: projectsSnap.data().count,
      leads: leadsSnap.data().count,
      portfolio: portfolioSnap.data().count,
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
