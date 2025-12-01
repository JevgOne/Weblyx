import { NextRequest, NextResponse } from "next/server";
import { turso } from "@/lib/turso";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Generate AI-ready project brief from lead data
 * This creates a comprehensive brief that can be used as input for AI tools
 */
function buildBriefPrompt(leadData: any): string {
  return `You are a professional project manager creating a comprehensive project brief for a web development project.

Based on the client's form submission, create a detailed, structured brief that can be used as input for AI development tools.

CLIENT FORM DATA:
==============

PROJECT TYPE: ${leadData.projectType}
COMPANY: ${leadData.companyName}
DESCRIPTION: ${leadData.businessDescription}

PROJECT DETAILS:
- Purpose: ${leadData.projectDetails?.purpose || 'not specified'}
- Target Audience: ${leadData.projectDetails?.targetAudience || 'not specified'}
- Main User Actions: ${leadData.projectDetails?.mainActions?.join(', ') || 'not specified'}
- Required Sections: ${leadData.projectDetails?.sections?.join(', ') || 'not specified'}
- Content Status: ${leadData.projectDetails?.hasContent || 'not specified'}
- Content Notes: ${leadData.projectDetails?.contentNotes || 'none'}

FEATURES NEEDED:
${leadData.features?.join(', ') || 'not specified'}

DESIGN PREFERENCES:
- Primary Color: ${leadData.designPreferences?.colors?.primary || 'not specified'}
- Secondary Color: ${leadData.designPreferences?.colors?.secondary || 'not specified'}
- Accent Color: ${leadData.designPreferences?.colors?.accent || 'not specified'}
- Style: ${leadData.designPreferences?.style || 'not specified'}
- Inspiration: ${leadData.designPreferences?.inspiration || 'none'}
- Must Have Features: ${leadData.designPreferences?.mustHave?.join(', ') || 'not specified'}
- Expectations: ${leadData.designPreferences?.expectations || 'not specified'}

TIMELINE: ${leadData.timeline}
BUDGET: ${leadData.budget}

TASK:
Create a comprehensive project brief in JSON format following this structure:

{
  "projectOverview": {
    "title": "string - catchy project title",
    "summary": "string - 2-3 sentence executive summary",
    "businessGoals": ["string"] - list of 3-5 main business objectives
  },
  "targetAudience": {
    "primaryAudience": "string - detailed description",
    "demographics": {
      "age": "string",
      "location": "string",
      "interests": "string"
    },
    "painPoints": ["string"] - list of 3-5 problems they face,
    "needs": ["string"] - list of 3-5 things they need from the website
  },
  "websiteGoals": {
    "primary": "string - main goal",
    "secondary": ["string"] - list of 3-5 secondary goals,
    "kpis": ["string"] - list of 3-5 measurable KPIs
  },
  "functionalRequirements": {
    "mustHave": ["string"] - critical features,
    "shouldHave": ["string"] - important but not critical,
    "niceToHave": ["string"] - optional features
  },
  "contentStrategy": {
    "contentStatus": "string - ready/partial/needed",
    "contentNeeds": ["string"] - list of content that needs to be created,
    "toneOfVoice": "string - professional/friendly/technical/etc",
    "keyMessages": ["string"] - 3-5 key messages to communicate
  },
  "designDirection": {
    "visualStyle": "string - modern/classic/minimal/bold/etc",
    "colorPalette": {
      "primary": "string - hex code",
      "secondary": "string - hex code",
      "accent": "string - hex code",
      "rationale": "string - why these colors fit the brand"
    },
    "typography": {
      "style": "string - modern/classic/playful/etc",
      "suggestions": "string - font pairing suggestions"
    },
    "imageStyle": "string - what kind of photography/illustrations to use",
    "inspirationAnalysis": "string - analysis of provided inspiration if any"
  },
  "siteStructure": {
    "pages": [
      {
        "name": "string",
        "purpose": "string",
        "keyContent": "string",
        "priority": "high/medium/low"
      }
    ],
    "userJourneys": [
      {
        "persona": "string",
        "goal": "string",
        "steps": ["string"] - journey steps
      }
    ]
  },
  "technicalConsiderations": {
    "platform": "string - Next.js/WordPress/etc recommendation",
    "hostingNeeds": "string",
    "integrations": ["string"] - required third-party integrations,
    "securityRequirements": ["string"]
  },
  "contentOutline": {
    "homepage": {
      "heroHeadline": "string",
      "heroSubheadline": "string",
      "heroCTA": "string",
      "sections": ["string"] - list of section names
    },
    "aboutPage": {
      "keyPoints": ["string"] - main things to communicate
    },
    "servicesProducts": {
      "offerings": ["string"] - list of services/products to highlight
    }
  },
  "callsToAction": {
    "primary": "string - main CTA",
    "secondary": ["string"] - alternative CTAs,
    "placement": "string - where CTAs should appear"
  },
  "timeline": {
    "urgency": "string - asap/normal/flexible",
    "suggestedPhases": [
      {
        "phase": "string",
        "duration": "string",
        "deliverables": ["string"]
      }
    ]
  },
  "successCriteria": {
    "launchCriteria": ["string"] - what defines a successful launch,
    "postLaunchMetrics": ["string"] - metrics to track after launch
  },
  "aiImplementationPrompt": "string - a detailed, ready-to-use prompt that can be given to AI development tools (v0, bolt.new, cursor) to start building this project. Should be comprehensive and include all key requirements, design direction, and technical specifications in a format optimized for AI code generation."
}

Make the brief:
1. Comprehensive - include all details from the form
2. Actionable - specific enough to start development
3. Professional - well-structured and clear
4. AI-ready - the aiImplementationPrompt should be a complete prompt that could be copy-pasted into v0, bolt.new, or cursor to start building

Be specific, avoid vague statements. Infer reasonable assumptions where information is missing but mark them as assumptions.`;
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Lead ID is required" },
        { status: 400 }
      );
    }

    // Get lead data from Turso
    const dbResult = await turso.execute({
      sql: 'SELECT * FROM leads WHERE id = ?',
      args: [id]
    });

    if (dbResult.rows.length === 0) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const row = dbResult.rows[0] as any;

    // Parse JSON fields
    const parseJSON = (field: any) => {
      if (!field) return null;
      try {
        return typeof field === 'string' ? JSON.parse(field) : field;
      } catch {
        return field;
      }
    };

    const leadData = {
      id: row.id,
      projectType: row.project_type,
      companyName: row.company,
      businessDescription: row.business_description,
      projectDetails: parseJSON(row.project_details),
      features: parseJSON(row.features),
      designPreferences: parseJSON(row.design_preferences),
      budget: row.budget_range,
      timeline: row.timeline,
    };

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY || ""
    );
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      }
    });

    // Generate brief
    const prompt = buildBriefPrompt(leadData);
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extract JSON from response (remove markdown if present)
    let brief;
    try {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      const jsonText = jsonMatch ? jsonMatch[1] : text;
      brief = JSON.parse(jsonText);
    } catch (e) {
      console.error("Failed to parse Gemini response as JSON:", e);
      // If JSON parsing fails, return the raw text
      brief = {
        rawResponse: text,
        error: "Failed to parse structured response",
      };
    }

    // Save brief to Turso
    await turso.execute({
      sql: `UPDATE leads
            SET ai_brief = ?,
                brief_generated_at = unixepoch(),
                updated_at = unixepoch()
            WHERE id = ?`,
      args: [JSON.stringify(brief), id]
    });

    // 📧 Trigger client proposal email in background (don't await)
    // This sends the email with AI design + brief to the client
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl?.origin || 'http://localhost:3000';
    fetch(`${siteUrl}/api/leads/${id}/send-proposal`, {
      method: "POST",
    })
      .then((res) => {
        if (res.ok) {
          console.log("✅ Client proposal email triggered");
        } else {
          console.warn("⚠️ Client proposal email failed:", res.statusText);
        }
      })
      .catch((err) => {
        console.warn("⚠️ Client proposal email error:", err);
      });

    return NextResponse.json({
      success: true,
      brief,
      leadId: id,
    });
  } catch (error: any) {
    console.error("❌ Error generating brief:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate brief",
      },
      { status: 500 }
    );
  }
}
