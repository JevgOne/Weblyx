import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, fileName } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: "Image URL is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Download image and convert to base64
    const imageResponse = await fetch(imageUrl);
    const arrayBuffer = await imageResponse.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    const imagePart = {
      inlineData: {
        data: base64,
        mimeType: imageResponse.headers.get('content-type') || 'image/jpeg',
      },
    };

    const prompt = `You are an SEO expert creating ALT text for images.
Analyze this image and create a concise, descriptive ALT text in CZECH language.

Requirements:
- Maximum 125 characters
- Describe what's in the image clearly
- Include relevant keywords for SEO
- Be specific and helpful for accessibility
- Use professional, clear language

${fileName ? `Original filename: ${fileName}` : ''}

Return ONLY the ALT text, nothing else. No quotes, no explanations.`;

    const result = await model.generateContent([prompt, imagePart]);
    const altText = result.response.text().trim();

    return NextResponse.json({
      success: true,
      data: {
        alt: altText,
      },
    });
  } catch (error: any) {
    console.error("Error generating ALT text:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate ALT text",
      },
      { status: 500 }
    );
  }
}
