import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const dynamic = "force-dynamic";

interface GenerateRequest {
  type: "ad_copy" | "creative_concept" | "audience_suggestion" | "hashtags";
  product: string;
  benefit: string;
  targetAudience?: string;
  tone?: string;
  language: "cs" | "en" | "de";
  platform: "facebook" | "instagram" | "both";
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const {
      type,
      product,
      benefit,
      targetAudience = "",
      tone = "friendly",
      language,
      platform,
    } = body;

    if (!product || !benefit || !language) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const langNames = { cs: "Czech", de: "German", en: "English" };
    const langFull = langNames[language];

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt = "";
    let result: any = {};

    switch (type) {
      case "ad_copy":
        prompt = `You are an expert Meta Ads copywriter. Generate ad copy in ${langFull}.

Product/Service: ${product}
Main Benefit: ${benefit}
Target Audience: ${targetAudience || "General"}
Tone: ${tone}
Platform: ${platform}

Generate:
1. 5 PRIMARY TEXT variations (max 125 characters before "See more", engaging, with emoji)
2. 5 HEADLINE variations (max 40 characters, punchy)
3. 3 DESCRIPTION variations (max 30 characters, for link description)
4. Best CALL-TO-ACTION buttons for this product

Output as JSON:
{
  "primary_texts": [{"text": "...", "angle": "benefit/urgency/social-proof/question"}],
  "headlines": [{"text": "...", "angle": "..."}],
  "descriptions": ["..."],
  "ctas": ["Shop Now", "Learn More", ...]
}`;
        break;

      case "creative_concept":
        prompt = `You are a creative director for Meta Ads. Create creative concepts in ${langFull}.

Product/Service: ${product}
Main Benefit: ${benefit}
Platform: ${platform}

Generate 3 creative concepts:
1. VIDEO CONCEPT (15-30 sec)
   - Hook (first 3 seconds)
   - Body (main message)
   - CTA (call to action)
   - Visual style

2. CAROUSEL CONCEPT
   - 5 cards with headlines and descriptions

3. STATIC IMAGE CONCEPT
   - Visual description
   - Text overlay
   - CTA

Output as JSON:
{
  "video_concept": {
    "name": "...",
    "hook": "...",
    "body": "...",
    "cta": "...",
    "style": "...",
    "script": "full 15-30 sec script"
  },
  "carousel_concept": {
    "name": "...",
    "cards": [{"headline": "...", "description": "..."}]
  },
  "image_concept": {
    "name": "...",
    "visual": "...",
    "text_overlay": "...",
    "cta": "..."
  }
}`;
        break;

      case "audience_suggestion":
        prompt = `You are a Meta Ads targeting expert. Suggest audiences for:

Product/Service: ${product}
Main Benefit: ${benefit}
Target Audience Hint: ${targetAudience || "Not specified"}

Generate audience suggestions:
1. INTEREST TARGETING (10-15 interests)
2. BEHAVIOR TARGETING (5-10 behaviors)
3. DEMOGRAPHIC SUGGESTIONS
4. CUSTOM AUDIENCE IDEAS (3)
5. LOOKALIKE AUDIENCE SOURCES (3)
6. EXCLUSIONS (who to exclude)

Output as JSON:
{
  "interests": ["..."],
  "behaviors": ["..."],
  "demographics": {
    "age_range": "25-45",
    "gender": "all/male/female",
    "locations": ["..."],
    "languages": ["..."]
  },
  "custom_audiences": [{"name": "...", "source": "...", "description": "..."}],
  "lookalike_sources": [{"source": "...", "percentage": "1-3%"}],
  "exclusions": ["..."]
}`;
        break;

      case "hashtags":
        prompt = `You are a social media hashtag expert. Generate hashtags for:

Product/Service: ${product}
Benefit: ${benefit}
Language: ${langFull}
Platform: ${platform}

Generate:
1. 5 HIGH-VOLUME hashtags (popular, broad reach)
2. 5 MEDIUM hashtags (moderate competition)
3. 5 NICHE hashtags (specific, engaged community)
4. 5 BRANDED/CAMPAIGN hashtags ideas

Output as JSON:
{
  "high_volume": ["#hashtag"],
  "medium": ["#hashtag"],
  "niche": ["#hashtag"],
  "branded": ["#hashtag"]
}`;
        break;

      default:
        return NextResponse.json(
          { success: false, error: "Invalid type" },
          { status: 400 }
        );
    }

    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 2000,
      },
    });

    const responseText = response.response.text();

    // Parse JSON from response
    try {
      const jsonMatch =
        responseText.match(/```json\n([\s\S]*?)\n```/) ||
        responseText.match(/```\n([\s\S]*?)\n```/) ||
        responseText.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseText;
      result = JSON.parse(jsonStr);
    } catch {
      result = { raw: responseText };
    }

    return NextResponse.json({
      success: true,
      type,
      data: result,
    });
  } catch (error: any) {
    console.error("Error generating content:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate content",
      },
      { status: 500 }
    );
  }
}
