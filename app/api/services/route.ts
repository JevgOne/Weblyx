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

    const servicesSnapshot = await adminDbInstance
      .collection("services")
      .where("enabled", "==", true)
      .orderBy("order", "asc")
      .get();

    const services = servicesSnapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        icon: data.icon,
        imageUrl: data.imageUrl || null,
        features: data.features || [],
        order: data.order || 0,
        enabled: data.enabled || false,
      };
    });

    return NextResponse.json({ success: true, data: services });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}
