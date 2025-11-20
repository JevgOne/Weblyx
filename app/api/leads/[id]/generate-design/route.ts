import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIDesignSuggestion } from "@/types/ai-design";

/**
 * Build AI prompt for design generation based on lead data
 */
function buildDesignPrompt(leadData: any): string {
  return `You are a professional web designer. Based on this information, suggest a complete design concept:

CLIENT INFORMATION:
- Project type: ${leadData.projectType}
- Company name: ${leadData.companyName}
- Business description: ${leadData.businessDescription}
- Target audience: ${leadData.targetAudience || 'not specified'}

DESIGN PREFERENCES:
- Primary color: ${leadData.designPreferences?.colors?.primary || 'none'}
- Secondary color: ${leadData.designPreferences?.colors?.secondary || 'none'}
- Style: ${leadData.designPreferences?.style || 'not specified'}
- Inspiration: ${leadData.designPreferences?.inspiration || 'none'}
- Must have: ${leadData.designPreferences?.mustHave?.join(', ') || 'not specified'}
- Expectations: ${leadData.designPreferences?.expectations || 'not specified'}

BUDGET: ${leadData.budget}
TIMELINE: ${leadData.timeline}

TASK:
Create a detailed website design proposal in JSON format with these sections:

1. **colorPalette** - complete color scheme (hex codes)
   - primary, secondary, accent, background, text, borders

2. **typography** - recommended fonts
   - headingFont, bodyFont, accentFont (with Google Fonts links)

3. **layoutSuggestions** - recommended structure
   - sections (array of sections: hero, about, services, etc.)
   - each section with description of what it should contain

4. **contentSuggestions** - text proposals
   - headline (main heading for hero section)
   - tagline (subheading)
   - ctaPrimary (main CTA button text)
   - aboutSection (company description proposal, 2-3 sentences)

5. **styleGuidelines** - style guide
   - mood (mood: professional, playful, elegant, etc.)
   - imageStyle (what kind of images to use)
   - uiElements (rounded corners, shadows, animations yes/no)

6. **technicalRecommendations**
   - recommendedFeatures (array of features to implement)
   - thirdPartyTools (e.g. Google Maps, Calendly, etc.)

7. **inspirationReferences** - 3-5 similar websites with explanation why

8. **implementationNotes** - notes for developers
   - what is priority
   - what can be nice-to-have
   - potential challenges

Return ONLY valid JSON without markdown formatting.`;
}

/**
 * Call Gemini API to generate design suggestions
 */
async function callGeminiAPI(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // Use Gemini 1.5 Pro for best results
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
    }
  });

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  if (!text) {
    throw new Error("Empty response from Gemini API");
  }

  return text;
}

/**
 * Parse AI response and validate structure
 */
function parseAIResponse(response: string): AIDesignSuggestion {
  try {
    // Try to extract JSON if wrapped in markdown
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : response;

    const parsed = JSON.parse(jsonStr);

    // Validate structure
    if (!parsed.colorPalette || !parsed.typography) {
      throw new Error("Invalid response structure - missing required fields");
    }

    return parsed as AIDesignSuggestion;
  } catch (error: any) {
    console.error("Failed to parse AI response:", error);
    throw new Error(`AI response parsing failed: ${error.message}`);
  }
}

/**
 * POST /api/leads/[id]/generate-design
 * Generate AI design suggestions for a lead
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const leadId = params.id;

    console.log(`🎨 Generating AI design for lead: ${leadId}`);

    // 1. Fetch lead from Firestore
    const leadDoc = await db.collection("leads").doc(leadId).get();

    if (!leadDoc.exists()) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    const leadData = leadDoc.data();

    // 2. Check if AI design already exists
    if (leadData.aiDesignSuggestion) {
      console.log(`ℹ️ AI design already exists for lead ${leadId}`);
      return NextResponse.json({
        success: true,
        designSuggestion: leadData.aiDesignSuggestion,
        message: "Design suggestion already exists",
      });
    }

    // 3. Build AI prompt with lead data
    const prompt = buildDesignPrompt(leadData);

    // 4. Call Gemini API
    let aiResponse: string;
    try {
      aiResponse = await callGeminiAPI(prompt);
    } catch (error: any) {
      console.error("❌ Gemini API error:", error);
      return NextResponse.json(
        {
          error: "AI generation failed",
          details: error.message,
        },
        { status: 500 }
      );
    }

    // 5. Parse and structure response
    let designSuggestion: AIDesignSuggestion;
    try {
      designSuggestion = parseAIResponse(aiResponse);
    } catch (error: any) {
      console.error("❌ Response parsing error:", error);
      return NextResponse.json(
        {
          error: "Failed to parse AI response",
          details: error.message,
        },
        { status: 500 }
      );
    }

    // 6. Save to Firestore
    await db.collection("leads").doc(leadId).update({
      aiDesignSuggestion: designSuggestion,
      aiGeneratedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    console.log(`✅ AI design generated and saved for lead ${leadId}`);

    return NextResponse.json({
      success: true,
      designSuggestion,
      message: "Design suggestion generated successfully",
    });
  } catch (error: any) {
    console.error("❌ Generate design error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to generate design",
      },
      { status: 500 }
    );
  }
}
