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

    // Fetch all portfolio projects from Firestore
    const portfolioSnapshot = await adminDbInstance
      .collection("portfolio")
      .orderBy("order", "asc")
      .get();

    const projects = portfolioSnapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert Firestore timestamps to ISO strings
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      };
    });

    console.log(`✅ Fetched ${projects.length} portfolio projects from Firestore`);

    return NextResponse.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error("Error fetching portfolio projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio projects" },
      { status: 500 }
    );
  }
}
