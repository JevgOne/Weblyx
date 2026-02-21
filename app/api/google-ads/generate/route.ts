import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface GenerateAdsRequest {
  businessName: string;
  businessDescription: string;
  targetKeywords?: string[];
  targetAudience?: string;
  language: "cs" | "de" | "en";
  campaignGoal: "traffic" | "leads" | "sales" | "brand";
}

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body: GenerateAdsRequest = await request.json();
    const {
      businessName,
      businessDescription,
      targetKeywords = [],
      targetAudience,
      language,
      campaignGoal,
    } = body;

    if (!businessName || !businessDescription || !language || !campaignGoal) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: businessName, businessDescription, language, campaignGoal",
        },
        { status: 400 }
      );
    }

    const languageNames = {
      cs: "Czech",
      de: "German",
      en: "English",
    };

    const goalDescriptions = {
      traffic: "drive website traffic",
      leads: "generate leads and inquiries",
      sales: "increase sales and conversions",
      brand: "build brand awareness",
    };

    const systemPrompt = `You are an expert Google Ads copywriter. Generate high-converting ad copy that follows Google Ads best practices and character limits.

**Rules:**
- Write in ${languageNames[language]}
- Headlines: Max 30 characters each
- Descriptions: Max 90 characters each
- Be specific, include numbers when relevant
- Include call-to-action
- Focus on benefits, not just features
- Use power words that drive action

**Response Format - ALWAYS use this exact JSON format:**
\`\`\`json
{
  "headlines": [
    "Headline 1 (max 30 chars)",
    "Headline 2 (max 30 chars)",
    "Headline 3 (max 30 chars)",
    "Headline 4 (max 30 chars)",
    "Headline 5 (max 30 chars)",
    "Headline 6 (max 30 chars)",
    "Headline 7 (max 30 chars)",
    "Headline 8 (max 30 chars)",
    "Headline 9 (max 30 chars)",
    "Headline 10 (max 30 chars)"
  ],
  "descriptions": [
    "Description 1 (max 90 chars)",
    "Description 2 (max 90 chars)",
    "Description 3 (max 90 chars)",
    "Description 4 (max 90 chars)"
  ],
  "keywords": [
    { "text": "keyword 1", "matchType": "PHRASE" },
    { "text": "keyword 2", "matchType": "EXACT" },
    { "text": "keyword 3", "matchType": "BROAD" }
  ],
  "negativeKeywords": ["negative keyword 1", "negative keyword 2"],
  "callouts": ["Callout 1", "Callout 2", "Callout 3", "Callout 4"],
  "sitelinks": [
    { "text": "Sitelink Text", "description": "Short description" }
  ]
}
\`\`\``;

    const userPrompt = `Generate Google Ads content for:

**Business:** ${businessName}
**Description:** ${businessDescription}
**Campaign Goal:** ${goalDescriptions[campaignGoal]}
${targetKeywords.length > 0 ? `**Target Keywords:** ${targetKeywords.join(", ")}` : ""}
${targetAudience ? `**Target Audience:** ${targetAudience}` : ""}

Create compelling ad copy that will maximize click-through rate and conversions. Include a variety of headlines with different angles (benefits, urgency, trust, features).`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    let generatedAds;
    try {
      const jsonMatch =
        responseText.match(/```json\n([\s\S]*?)\n```/) ||
        responseText.match(/```\n([\s\S]*?)\n```/);
      const jsonText = jsonMatch ? jsonMatch[1] : responseText;
      generatedAds = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("Failed to parse Claude response:", parseError);
      return NextResponse.json(
        {
          success: false,
          error: "AI generated response in incorrect format",
          rawResponse: responseText,
        },
        { status: 500 }
      );
    }

    // Validate character limits
    const validatedAds = {
      headlines: generatedAds.headlines
        ?.filter((h: string) => h && h.length <= 30)
        .slice(0, 15) || [],
      descriptions: generatedAds.descriptions
        ?.filter((d: string) => d && d.length <= 90)
        .slice(0, 4) || [],
      keywords: generatedAds.keywords || [],
      negativeKeywords: generatedAds.negativeKeywords || [],
      callouts: generatedAds.callouts?.slice(0, 10) || [],
      sitelinks: generatedAds.sitelinks?.slice(0, 4) || [],
    };

    return NextResponse.json({
      success: true,
      data: validatedAds,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      },
    });
  } catch (error: any) {
    console.error("Error generating ads:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate ad content",
      },
      { status: 500 }
    );
  }
}
