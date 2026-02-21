import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { prompt, aspectRatio = "1:1" } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "GEMINI_API_KEY not configured" },
        { status: 500 }
      );
    }

    // Use Gemini's imagen model for image generation
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // For now, we'll use text-to-image description since direct Imagen API
    // requires different setup. This returns a detailed description that can
    // be used with external tools or we can integrate Imagen separately.

    const enhancedPrompt = `Create a detailed, professional advertising image description for this concept: ${prompt}

    The image should be:
    - High quality, professional advertising style
    - Suitable for Meta Ads (Facebook/Instagram)
    - Aspect ratio: ${aspectRatio}
    - Clean, modern design
    - Eye-catching and thumb-stopping

    Provide a detailed visual description that could be used to create this image.`;

    const result = await model.generateContent(enhancedPrompt);
    const description = result.response.text();

    // For actual image generation, we need to use Vertex AI Imagen
    // For now, return the enhanced prompt for manual generation
    return NextResponse.json({
      success: true,
      data: {
        originalPrompt: prompt,
        enhancedDescription: description,
        aspectRatio,
        // When Imagen is fully integrated, this would include:
        // imageUrl: "generated-image-url",
        // imageBase64: "base64-encoded-image",
        message: "Pro generování obrázku použij tento prompt v Midjourney nebo DALL-E",
      },
    });
  } catch (error: any) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
