import { NextRequest, NextResponse } from "next/server";
import { adminDbInstance } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    if (!adminDbInstance) {
      return NextResponse.json(
        { error: "Firebase Admin not initialized" },
        { status: 500 }
      );
    }

    // Fetch all projects from Firestore
    const projectsSnapshot = await adminDbInstance
      .collection("projects")
      .orderBy("createdAt", "desc")
      .get();

    const projects = projectsSnapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert Firestore timestamps to ISO strings
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        deadline: data.deadline?.toDate?.()?.toISOString() || data.deadline,
      };
    });

    console.log(`✅ Fetched ${projects.length} projects from Firestore`);

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
