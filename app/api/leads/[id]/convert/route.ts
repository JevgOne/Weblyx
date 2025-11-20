import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";

// Format AI design suggestions for project notes
function formatAINotesForProject(aiSuggestion: any): string {
  if (!aiSuggestion) return "";

  return `AI DESIGN NÁVRH:

BARVY:
- Primární: ${aiSuggestion.colorPalette?.primary || "N/A"}
- Sekundární: ${aiSuggestion.colorPalette?.secondary || "N/A"}
- Akcent: ${aiSuggestion.colorPalette?.accent || "N/A"}
- Pozadí: ${aiSuggestion.colorPalette?.background || "N/A"}
- Text: ${aiSuggestion.colorPalette?.text || "N/A"}

TYPOGRAFIE:
- Nadpisy: ${aiSuggestion.typography?.headingFont || "N/A"}
- Text: ${aiSuggestion.typography?.bodyFont || "N/A"}

HLAVNÍ TEXTY:
- Headline: ${aiSuggestion.contentSuggestions?.headline || "N/A"}
- Tagline: ${aiSuggestion.contentSuggestions?.tagline || "N/A"}
- CTA: ${aiSuggestion.contentSuggestions?.ctaPrimary || "N/A"}

STYL: ${aiSuggestion.styleGuidelines?.mood || "N/A"}
OBRÁZKY: ${aiSuggestion.styleGuidelines?.imageStyle || "N/A"}

DOPORUČENÉ FUNKCE:
${aiSuggestion.technicalRecommendations?.recommendedFeatures?.map((f: string) => `- ${f}`).join('\n') || "- N/A"}

PRIORITY:
${aiSuggestion.implementationNotes?.priorities?.map((p: string) => `- ${p}`).join('\n') || "- N/A"}

NICE-TO-HAVE:
${aiSuggestion.implementationNotes?.niceToHave?.map((n: string) => `- ${n}`).join('\n') || "- N/A"}

DOPORUČENÉ SEKCE:
${aiSuggestion.layoutSuggestions?.sections?.map((s: any) => `- ${s.name} (${s.priority}): ${s.description}`).join('\n') || "- N/A"}

---
(Automaticky vygenerováno AI)`;
}

// Auto-generate project number in format WBX-2025-XXXX
async function generateProjectNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `WBX-${year}-`;

  try {
    // Get all projects to find the highest number
    const projectsSnapshot = await db.collection("projects").get();

    let maxNumber = 0;
    projectsSnapshot.docs.forEach((doc: any) => {
      const project = doc.data();
      if (project.projectNumber && project.projectNumber.startsWith(prefix)) {
        const numberPart = parseInt(project.projectNumber.split("-").pop() || "0");
        if (numberPart > maxNumber) {
          maxNumber = numberPart;
        }
      }
    });

    // Increment and format
    const nextNumber = maxNumber + 1;
    return `${prefix}${nextNumber.toString().padStart(4, "0")}`;
  } catch (error) {
    console.error("Error generating project number:", error);
    // Fallback to timestamp-based number
    return `${prefix}${Date.now().toString().slice(-4)}`;
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const leadId = params.id;
    const body = await request.json();

    // Validation
    if (!body.projectName || !body.clientName || !body.clientEmail || !body.priceTotal || !body.deadline) {
      return NextResponse.json(
        { error: "Vyplňte prosím všechna povinná pole" },
        { status: 400 }
      );
    }

    // Fetch the lead
    const leadDoc = await db.collection("leads").doc(leadId).get();

    if (!leadDoc.exists()) {
      return NextResponse.json(
        { error: "Poptávka nebyla nalezena" },
        { status: 404 }
      );
    }

    const leadData = leadDoc.data();

    // Check if already converted
    if (leadData.convertedToProjectId) {
      return NextResponse.json(
        { error: "Tato poptávka již byla převedena na projekt" },
        { status: 400 }
      );
    }

    // Generate project number
    const projectNumber = await generateProjectNumber();

    // Format notes with AI suggestions if available
    const aiNotes = leadData.aiDesignSuggestion
      ? formatAINotesForProject(leadData.aiDesignSuggestion)
      : "";

    const combinedNotes = [
      aiNotes,
      body.notes || ""
    ].filter(Boolean).join("\n\n");

    // Create project document matching Project type
    const projectData = {
      // Project details
      projectNumber,
      name: body.projectName,
      projectType: body.projectType,
      status: parseFloat(body.priceDeposit || "0") > 0 ? "in_progress" : "unpaid",
      priority: body.priority || "medium",
      progress: 0,

      // Client info
      clientName: body.clientName,
      clientEmail: body.clientEmail,
      clientPhone: body.clientPhone || "",

      // Dates
      startDate: body.startDate,
      deadline: body.deadline,

      // Financials
      priceTotal: parseFloat(body.priceTotal),
      pricePaid: parseFloat(body.priceDeposit || "0"),
      currency: "CZK",

      // Technical info
      productionUrl: body.hostingUrl || "",
      githubRepo: body.githubRepo || "",
      hostingProvider: body.hostingType || undefined,
      hostingInfo: body.hostingUsername && body.hostingPassword
        ? `Username: ${body.hostingUsername}\nPassword: ${body.hostingPassword}\nBranch: ${body.githubBranch || "main"}\n\nNotes:\n${combinedNotes}`
        : combinedNotes,
      domainName: body.hostingUrl ? (body.hostingUrl.startsWith("http") ? new URL(body.hostingUrl).hostname : body.hostingUrl) : "",

      // Link back to lead
      convertedFromLeadId: leadId,

      // Metadata
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add project to Firestore
    const projectRef = await db.collection("projects").add(projectData);

    // Update lead status to "converted" and link to project
    await db.collection("leads").doc(leadId).update({
      status: "converted",
      convertedToProjectId: projectRef.id,
      convertedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    console.log(`✅ Lead ${leadId} converted to project ${projectRef.id} (${projectNumber})`);

    return NextResponse.json(
      {
        success: true,
        message: "Poptávka byla úspěšně převedena na projekt",
        projectId: projectRef.id,
        projectNumber,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Lead conversion error:", error);
    return NextResponse.json(
      { error: error.message || "Došlo k chybě při převodu poptávky" },
      { status: 500 }
    );
  }
}
