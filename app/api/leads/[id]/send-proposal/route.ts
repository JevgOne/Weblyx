import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { sendEmail } from "@/lib/email/resend-client";
import { generateClientProposalEmail } from "@/lib/email/lead-templates";

/**
 * POST /api/leads/[id]/send-proposal
 * Send AI proposal email to client
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const leadId = params.id;

    // 1. Fetch lead from Firestore
    const { doc, getDoc, updateDoc } = await import('firebase/firestore');
    const leadDocRef = doc(db, "leads", leadId);
    const leadDoc = await getDoc(leadDocRef);

    if (!leadDoc.exists()) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    const leadData = leadDoc.data();

    // 2. Check if email was already sent
    if (leadData.proposalEmailSent) {
      return NextResponse.json({
        success: true,
        message: "Proposal email was already sent",
        alreadySent: true,
      });
    }

    // 3. Prepare email data
    const emailTemplate = generateClientProposalEmail({
      clientName: leadData.name,
      companyName: leadData.companyName,
      aiDesignSuggestion: leadData.aiDesignSuggestion,
      aiBrief: leadData.aiBrief,
    });

    // 4. Send email
    const result = await sendEmail({
      to: leadData.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });

    if (!result.success) {
      console.error("❌ Failed to send proposal email:", result.error);
      return NextResponse.json(
        {
          error: "Failed to send email",
          details: result.error,
        },
        { status: 500 }
      );
    }

    // 5. Mark email as sent in Firestore
    await updateDoc(leadDocRef, {
      proposalEmailSent: true,
      proposalEmailSentAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Proposal email sent successfully",
    });
  } catch (error: any) {
    console.error("❌ Send proposal error:", error);
    return NextResponse.json(
      {
        error: "Failed to send proposal",
      },
      { status: 500 }
    );
  }
}
