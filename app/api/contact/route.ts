import { NextRequest, NextResponse } from "next/server";
import { turso } from "@/lib/turso";
import { Lead } from "@/types/cms";
import { validateHoneypot, validateSubmissionTime } from "@/lib/security/honeypot";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, projectType, companyName, description, __form_timestamp } = body;

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
    if (!name || !email || !projectType || !companyName || !description) {
      return NextResponse.json(
        { error: "Jméno, email, typ projektu, název firmy a popis jsou povinné." },
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

    // Save lead to Turso
    const leadId = nanoid();

    await turso.execute({
      sql: `
        INSERT INTO leads (
          id, name, email, phone, company, project_type,
          business_description, status, source, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())
      `,
      args: [
        leadId,
        name,
        email,
        phone || null,
        companyName,
        projectType,
        description,
        'new',
        'contact_form',
      ],
    });

    console.log("✅ New lead created in Turso:", { leadId, name, email, companyName, projectType });

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
