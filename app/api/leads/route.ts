import { NextRequest, NextResponse } from "next/server";
import { turso } from "@/lib/turso";
import { sendEmail, EMAIL_CONFIG } from "@/lib/email/resend-client";
import { generateAdminNotificationEmail, generateClientThankYouEmail } from "@/lib/email/lead-templates";
import { sendPushNotificationToAdmins } from "@/lib/push-notifications/send-notification";
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
          status, source, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())
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
        budget || null,
        timeline || null,
        additionalRequirements || null,
        howDidYouHear || null,
        preferredContact || null,
        preferredMeetingTime || null,
        "new",
        "questionnaire",
      ],
    });

    console.log("✅ Lead saved to Turso:", leadId);

    // 📧 Send thank you email to client immediately
    const clientEmailTemplate = generateClientThankYouEmail({
      clientName: name,
      companyName,
    });

    sendEmail({
      to: email,
      subject: clientEmailTemplate.subject,
      html: clientEmailTemplate.html,
      text: clientEmailTemplate.text,
    }).then((result) => {
      if (result.success) {
        console.log("✅ Client thank you email sent to:", email);
      } else {
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
      budget,
      timeline,
      businessDescription,
      features,
      designPreferences,
    });

    // Send email notification
    sendEmail({
      to: EMAIL_CONFIG.adminEmail,
      subject: adminEmailTemplate.subject,
      html: adminEmailTemplate.html,
      text: adminEmailTemplate.text,
      replyTo: email,
    }).then((result) => {
      if (result.success) {
        console.log("✅ Admin notification email sent");
      } else {
        console.warn("⚠️ Admin notification email failed:", result.error);
      }
    }).catch((err) => {
      console.warn("⚠️ Admin notification error:", err);
    });

    // 🔔 Send push notification to admin(s)
    sendPushNotificationToAdmins({
      title: '🔔 Nová poptávka!',
      body: `${companyName} - ${projectType} | ${budget}`,
      url: `/admin/leads`,
      tag: `lead-${leadId}`,
      data: {
        leadId: leadId,
        type: 'new_lead',
      },
    }).then((result) => {
      if (result.success) {
        console.log(`✅ Push notification sent to ${result.sent} admin(s)`);
      } else {
        console.warn("⚠️ Push notification failed:", result.error);
      }
    }).catch((err) => {
      console.warn("⚠️ Push notification error:", err);
    });

    // 🤖 Trigger AI generation in background (don't await)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;

    // Generate AI Design
    fetch(`${siteUrl}/api/leads/${leadId}/generate-design`, {
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

    // Generate AI Brief
    fetch(`${siteUrl}/api/leads/${leadId}/generate-brief`, {
      method: "POST",
    })
      .then((res) => {
        if (res.ok) {
          console.log("✅ AI brief generation triggered");
        } else {
          console.warn("⚠️ AI brief generation failed:", res.statusText);
        }
      })
      .catch((err) => {
        console.warn("⚠️ AI brief generation error:", err);
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
