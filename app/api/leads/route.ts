import { NextRequest, NextResponse } from "next/server";
import { adminDbInstance } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      projectType,
      projectTypeOther,
      companyName,
      businessDescription,
      features,
      designPreferences,
      budget,
      timeline,
      name,
      email,
      phone,
    } = body;

    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { error: "Jméno a email jsou povinné." },
        { status: 400 }
      );
    }

    if (!projectType || !companyName || !businessDescription) {
      return NextResponse.json(
        { error: "Vyplňte prosím všechny povinné údaje." },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Neplatný formát emailu." },
        { status: 400 }
      );
    }

    // Prepare lead data
    const leadData = {
      projectType,
      projectTypeOther: projectTypeOther || "",
      companyName,
      businessDescription,
      features: features || [],
      designPreferences: designPreferences || {},
      budget: budget || "",
      timeline: timeline || "",
      name,
      email,
      phone: phone || "",
      status: "new",
      source: "questionnaire",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save lead to Firestore
    if (!adminDbInstance) {
      console.error("❌ Firebase Admin not initialized");
      return NextResponse.json(
        { error: "Databáze není dostupná." },
        { status: 500 }
      );
    }

    const leadRef = await adminDbInstance.collection("leads").add(leadData);
    console.log("✅ Lead saved to Firestore:", leadRef.id);

    // Trigger AI design generation in background (don't await)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
    fetch(`${siteUrl}/api/leads/${leadRef.id}/generate-design`, {
      method: "POST",
    })
      .then((res) => {
        if (res.ok) {
          console.log("✅ AI design generation triggered");
        } else {
          console.warn("⚠️ AI design generation failed:", res.statusText);
        }
      })
      .catch((err) => {
        console.warn("⚠️ AI design generation error:", err);
      });

    return NextResponse.json(
      {
        success: true,
        leadId: leadRef.id,
        message: "Děkujeme za vaši poptávku! Ozveme se vám do 24 hodin.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Lead submission error:", error);
    return NextResponse.json(
      { error: "Došlo k chybě při odesílání. Zkuste to prosím znovu." },
      { status: 500 }
    );
  }
}
