import { NextRequest, NextResponse } from "next/server";
import { adminDbInstance } from "@/lib/firebase-admin";
import { Lead } from "@/types/cms";
import { validateHoneypot, validateSubmissionTime } from "@/lib/security/honeypot";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, projectType, budget, message, __form_timestamp } = body;

    // 🤖 BOT DETECTION: Honeypot validation
    if (!validateHoneypot(body)) {
      console.log('🚫 Bot detected in contact form (honeypot)');
      // Return success to bot to avoid detection
      return NextResponse.json(
        { success: true, message: "Děkujeme za vaši zprávu!" },
        { status: 200 }
      );
    }

    // 🤖 BOT DETECTION: Time-based validation
    if (__form_timestamp && !validateSubmissionTime(__form_timestamp, 3)) {
      console.log('🚫 Bot detected in contact form (too fast)');
      // Return success to bot to avoid detection
      return NextResponse.json(
        { success: true, message: "Děkujeme za vaši zprávu!" },
        { status: 200 }
      );
    }

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Jméno, email a zpráva jsou povinné." },
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

    // Save lead to Firestore
    const leadData: Omit<Lead, 'id'> = {
      name,
      email,
      phone: phone || '',
      projectType: projectType || '',
      budget: budget || '',
      message,
      status: 'new',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (adminDbInstance) {
      await adminDbInstance.collection('leads').add(leadData);
    }

    console.log("New lead created:", { name, email, projectType });

    // TODO: Send email notification
    // Example with Resend:
    // await resend.emails.send({
    //   from: 'Weblyx <info@weblyx.cz>',
    //   to: 'info@weblyx.cz',
    //   subject: `Nová poptávka od ${name}`,
    //   html: `...`
    // });

    return NextResponse.json(
      {
        success: true,
        message: "Děkujeme za vaši zprávu! Ozveme se vám do 24 hodin.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Došlo k chybě při odesílání. Zkuste to prosím znovu." },
      { status: 500 }
    );
  }
}
