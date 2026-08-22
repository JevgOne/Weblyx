import { NextRequest, NextResponse, after } from "next/server";
import { turso } from "@/lib/turso";
import { sendEmail, EMAIL_CONFIG } from "@/lib/email/resend-client";
import { generateAdminNotificationEmail, generateClientThankYouEmail } from "@/lib/email/lead-templates";
import { sendPushNotificationToAdmins } from "@/lib/push-notifications/send-notification";
import { sendTelegramNotification } from "@/lib/telegram";
import { validateHoneypot, validateSubmissionTime } from "@/lib/security/honeypot";
import { getPricingData } from "@/lib/pricing/server";
import { buildConfiguration, formatCzk, type LeadConfiguration } from "@/lib/pricing/types";
import { internalRequestHeaders } from "@/lib/auth/internal-request";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      projectType,
      projectTypeOther,
      projectGoal,
      projectReason,
      companyName,
      businessDescription,
      existingWebsite,
      companySize,
      industry,
      ico,
      address,
      yearsInBusiness,
      socialMedia,
      customerAcquisition,
      usp,
      topCompetitors,
      projectDetails,
      features,
      designPreferences,
      marketingTech,
      budget,
      timeline,
      name,
      email,
      phone,
      additionalRequirements,
      howDidYouHear,
      preferredContact,
      preferredMeetingTime,
      configuration,
      gdprConsent,
      __form_timestamp,
    } = body;

    // 🤖 Bot detection — answer like a success so bots learn nothing
    if (!validateHoneypot(body)) {
      return NextResponse.json(
        { success: true, message: "Děkujeme za vaši poptávku!" },
        { status: 200 }
      );
    }

    if (__form_timestamp && !validateSubmissionTime(__form_timestamp, 3)) {
      return NextResponse.json(
        { success: true, message: "Děkujeme za vaši poptávku!" },
        { status: 200 }
      );
    }

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

    if (!gdprConsent) {
      return NextResponse.json(
        { error: "Bez souhlasu se zpracováním osobních údajů nelze poptávku odeslat." },
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

    /**
     * The client sends IDs only. Hours and price are recomputed here from the
     * price list, so a hand-edited URL cannot dictate what a project costs.
     */
    let leadConfiguration: LeadConfiguration | null = null;

    if (configuration) {
      const tierId = typeof configuration.tierId === "string" ? configuration.tierId : null;
      const addonIds = Array.isArray(configuration.addonIds)
        ? configuration.addonIds.filter((id: unknown): id is string => typeof id === "string")
        : [];

      if (!tierId) {
        return NextResponse.json(
          { error: "Neplatná konfigurace balíčku." },
          { status: 400 }
        );
      }

      const pricing = await getPricingData();
      leadConfiguration = buildConfiguration(pricing, tierId, addonIds);
    }

    const budgetRange = leadConfiguration
      ? `${formatCzk(leadConfiguration.totalPrice)} Kč`
      : budget || null;

    // Generate unique ID
    const leadId = nanoid();

    // Save lead to Turso
    await turso.execute({
      sql: `
        INSERT INTO leads (
          id, name, email, phone, company, project_type,
          project_type_other, project_goal, project_reason,
          business_description, existing_website, company_size, industry,
          ico, address, years_in_business, social_media,
          customer_acquisition, usp, top_competitors,
          project_details, features, design_preferences, marketing_tech,
          budget_range, timeline, additional_requirements,
          how_did_you_hear, preferred_contact, preferred_meeting_time,
          configuration, status, source, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())
      `,
      args: [
        leadId,
        name,
        email,
        phone || null,
        companyName,
        projectType,
        projectTypeOther || null,
        projectGoal || null,
        projectReason || null,
        businessDescription,
        existingWebsite || null,
        companySize || null,
        industry || null,
        ico || null,
        address || null,
        yearsInBusiness || null,
        JSON.stringify(socialMedia || {}),
        customerAcquisition || null,
        usp || null,
        JSON.stringify(topCompetitors || []),
        JSON.stringify(projectDetails || {}),
        JSON.stringify(features || []),
        JSON.stringify(designPreferences || {}),
        JSON.stringify(marketingTech || {}),
        budgetRange,
        timeline || null,
        additionalRequirements || null,
        howDidYouHear || null,
        preferredContact || null,
        preferredMeetingTime || null,
        leadConfiguration ? JSON.stringify(leadConfiguration) : null,
        "new",
        "questionnaire",
      ],
    });

    // 📧 Send thank you email to client immediately
    const clientEmailTemplate = generateClientThankYouEmail({
      clientName: name,
      companyName,
      projectType,
    });

    sendEmail({
      to: email,
      subject: clientEmailTemplate.subject,
      html: clientEmailTemplate.html,
      text: clientEmailTemplate.text,
    }).then((result) => {
      if (!result.success) {
        console.warn("⚠️ Client thank you email failed:", result.error);
      }
    }).catch((err) => {
      console.warn("⚠️ Client email error:", err);
    });

    // 📧 Send admin notification email immediately
    const adminEmailTemplate = generateAdminNotificationEmail({
      id: leadId,
      name,
      email,
      phone,
      companyName,
      projectType,
      budget: budgetRange || "",
      timeline,
      businessDescription,
      features,
      designPreferences,
      configuration: leadConfiguration,
    });

    // Send email notification
    sendEmail({
      to: EMAIL_CONFIG.adminEmail,
      subject: adminEmailTemplate.subject,
      html: adminEmailTemplate.html,
      text: adminEmailTemplate.text,
      replyTo: email,
    }).then((result) => {
      if (!result.success) {
        console.warn("⚠️ Admin notification email failed:", result.error);
      }
    }).catch((err) => {
      console.warn("⚠️ Admin notification error:", err);
    });

    // 🔔 Send push notification to admin(s)
    const pushSummary = leadConfiguration
      ? `${leadConfiguration.tierName} · ${formatCzk(leadConfiguration.totalPrice)} Kč`
      : budgetRange || projectType;

    sendPushNotificationToAdmins({
      title: '🔔 Nová poptávka!',
      body: `${companyName} - ${projectType} | ${pushSummary}`,
      url: `/admin/leads`,
      tag: `lead-${leadId}`,
      data: {
        leadId: leadId,
        type: 'new_lead',
      },
    }).then((result) => {
      if (!result.success) {
        console.warn("⚠️ Push notification failed:", result.error);
      }
    }).catch((err) => {
      console.warn("⚠️ Push notification error:", err);
    });

    // 📱 Send Telegram notification (MUST await to ensure it completes)
    try {
      const telegramSent = await sendTelegramNotification({
        name,
        email,
        phone,
        company: companyName,
        projectType,
        budget: budgetRange || undefined,
        description: businessDescription,
        leadId,
        configuration: leadConfiguration,
      });

      if (!telegramSent) {
        console.error("❌ [LEAD API] Telegram notification failed - check logs above");
      }
    } catch (err: any) {
      console.error("❌ [LEAD API] Telegram notification error:", err.message);
      console.error("❌ [LEAD API] Stack:", err.stack);
    }

    /**
     * AI generation runs after the response. `after()` keeps the serverless
     * function alive until it finishes — a bare fetch used to be cut off when
     * the function froze, so the generation often never completed.
     */
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
    const internalHeaders = internalRequestHeaders();

    after(async () => {
      const trigger = async (endpoint: string) => {
        try {
          const res = await fetch(`${siteUrl}/api/leads/${leadId}/${endpoint}`, {
            method: "POST",
            headers: internalHeaders,
          });
          if (!res.ok) {
            console.warn(`⚠️ ${endpoint} failed:`, res.status, res.statusText);
          }
        } catch (err) {
          console.warn(`⚠️ ${endpoint} error:`, err);
        }
      };

      await Promise.all([trigger("generate-design"), trigger("generate-brief")]);
    });

    return NextResponse.json(
      {
        success: true,
        leadId: leadId,
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
