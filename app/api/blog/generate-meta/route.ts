import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { content, title } = await request.json();

    if (!content || !title) {
      return NextResponse.json(
        { error: "Content and title are required" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Clean content - remove markdown and limit length
    const cleanContent = content
      .replace(/[#*`_]/g, "")
      .substring(0, 2000);

    const prompt = `Jsi SEO expert. Na základě následujícího článku vytvoř:

1. SEO-optimalizovaný meta title (max 60 znaků)
2. Meta description (max 160 znaků)

Článek:
Název: ${title}
Obsah: ${cleanContent}

Odpověď musí být POUZE v tomto JSON formátu (bez dalšího textu):
{
  "metaTitle": "...",
  "metaDescription": "..."
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Try to extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid AI response format");
    }

    let generated: any;
    try {
      generated = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json({ success: false, error: 'Failed to parse AI response' }, { status: 500 });
    }

    // Validate lengths
    if (generated.metaTitle.length > 70) {
      generated.metaTitle = generated.metaTitle.substring(0, 67) + "...";
    }
    if (generated.metaDescription.length > 165) {
      generated.metaDescription = generated.metaDescription.substring(0, 162) + "...";
    }

    return NextResponse.json({
      success: true,
      data: generated,
    });
  } catch (error: any) {
    console.error("Error generating meta tags:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate meta tags",
      },
      { status: 500 }
    );
  }
}
