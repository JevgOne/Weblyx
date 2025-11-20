import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { DesignPreference, AIGeneratedDesigns, AIDesignVariant } from '@/types/cms';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { designPreferences } = await request.json() as { designPreferences: DesignPreference };

    if (!designPreferences) {
      return NextResponse.json(
        { error: 'Design preferences are required' },
        { status: 400 }
      );
    }

    // Generate 3 unique design variants using Claude
    const prompt = `You are an expert web designer. Based on the following client requirements, generate 3 completely different website design concepts.

Client Requirements:
- Industry: ${designPreferences.industry}
- Target Audience: ${designPreferences.targetAudience}
- Style Preference: ${designPreferences.stylePreference}
- Color Preferences: ${designPreferences.colorPreferences.join(', ')}
- Inspiration URLs: ${designPreferences.inspirationUrls.join(', ') || 'None provided'}
- Required Features: ${designPreferences.requiredFeatures.join(', ')}
- Content Ready: ${designPreferences.contentReady ? 'Yes' : 'No'}
- Additional Notes: ${designPreferences.additionalNotes || 'None'}

Generate exactly 3 unique design variants with these characteristics:
1. Design A: Minimalist/Clean approach
2. Design B: Modern/Bold approach
3. Design C: Classic/Elegant approach

For each design, provide:
- style: One-word description (Minimalistický/Moderní/Klasický)
- colorPalette: {primary, secondary, accent, background, text} - actual hex codes
- typography: {headingFont, bodyFont, fontPairing} - real Google Fonts
- layoutStyle: Detailed description (e.g., "Asymmetric grid with bold typography")
- visualElements: Array of 3-5 specific elements (e.g., ["Geometric shapes", "High-contrast photography"])
- moodboardPrompt: A detailed prompt for AI image generation to create a moodboard
- reasoning: 2-3 sentences explaining why this design fits the client's business

Return ONLY valid JSON in this exact format:
{
  "designs": [
    {
      "id": "design-a",
      "name": "Design A",
      "style": "Minimalistický",
      "colorPalette": {
        "primary": "#hex",
        "secondary": "#hex",
        "accent": "#hex",
        "background": "#hex",
        "text": "#hex"
      },
      "typography": {
        "headingFont": "Font Name",
        "bodyFont": "Font Name",
        "fontPairing": "Description"
      },
      "layoutStyle": "Description",
      "visualElements": ["element1", "element2", "element3"],
      "moodboardPrompt": "Detailed prompt",
      "reasoning": "Why this works"
    },
    ... two more designs
  ]
}`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Parse Claude's response
    const responseText = content.text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const parsedDesigns = JSON.parse(jsonMatch[0]);

    const aiGeneratedDesigns: AIGeneratedDesigns = {
      designs: parsedDesigns.designs as [AIDesignVariant, AIDesignVariant, AIDesignVariant],
      generatedAt: new Date(),
      basedOn: designPreferences
    };

    return NextResponse.json({
      success: true,
      data: aiGeneratedDesigns
    });

  } catch (error) {
    console.error('Error generating designs:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate designs'
      },
      { status: 500 }
    );
  }
}
