import { NextRequest, NextResponse } from "next/server";
import { turso } from "@/lib/turso";
import { Lead } from "@/types/cms";
import { validateHoneypot, validateSubmissionTime } from "@/lib/security/honeypot";
import { nanoid } from "nanoid";
import { sendEmail, EMAIL_CONFIG } from "@/lib/email/resend-client";
import { generateContactFormEmail } from "@/lib/email/templates";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name, email, phone, projectType, companyName, description, __form_timestamp,
      // Where the visitor came from. Optional — organic and direct traffic
      // carries none of it, and the enquiry is just as real without it.
      utm_source, utm_medium, utm_campaign, utm_term, utm_content,
      gclid, landing_page, referrer,
    } = body;

    /** Attribution is visitor-supplied text; cap it rather than trust it. */
    const attr = (value: unknown, max = 200): string | null =>
      typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;

    // 🤖 BOT DETECTION: Honeypot validation
    if (!validateHoneypot(body)) {
      // Return success to bot to avoid detection
      return NextResponse.json(
        { success: true, message: "Děkujeme za vaši zprávu!" },
        { status: 200 }
      );
    }

    // 🤖 BOT DETECTION: Time-based validation
    if (__form_timestamp && !validateSubmissionTime(__form_timestamp, 3)) {
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
          business_description, status, source,
          utm_source, utm_medium, utm_campaign, utm_term, utm_content,
          gclid, landing_page, referrer,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())
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
        attr(utm_source),
        attr(utm_medium),
        attr(utm_campaign),
        attr(utm_term),
        attr(utm_content),
        attr(gclid),
        attr(landing_page),
        attr(referrer, 300),
      ],
    });

    // Send email notification to admin
    try {
      const emailHtml = generateContactFormEmail({
        name,
        email,
        phone: phone || undefined,
        companyName,
        projectType,
        description,
        leadId,
      });

      const emailResult = await sendEmail({
        to: EMAIL_CONFIG.adminEmail,
        subject: `📬 Nová poptávka od ${name} (${companyName})`,
        html: emailHtml,
        replyTo: email,
      });

      if (!emailResult.success) {
        console.error("⚠️ Failed to send admin notification:", emailResult.error);
        // Don't fail the request if email fails - lead is already saved
      }
    } catch (emailError) {
      console.error("⚠️ Email notification error:", emailError);
      // Continue - lead is saved, email is not critical
    }

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
