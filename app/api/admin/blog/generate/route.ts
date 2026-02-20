import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface GenerateBlogRequest {
  topic: string;
  keywords?: string[];
  articleType: 'tutorial' | 'review' | 'case-study' | 'news' | 'guide' | 'listicle';
  targetAudience?: string;
  length: 'short' | 'medium' | 'long'; // 500 / 1000 / 2000+ words
  language: 'cs' | 'de';
  tone?: 'professional' | 'casual' | 'technical';
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateBlogRequest = await request.json();
    const { topic, keywords = [], articleType, targetAudience, length, language, tone = 'professional' } = body;

    // Validate input
    if (!topic || !articleType || !length || !language) {
      return NextResponse.json(
        { error: 'Chybí povinná pole (topic, articleType, length, language)' },
        { status: 400 }
      );
    }

    // Define word count targets
    const wordCounts = {
      short: '500-800',
      medium: '1000-1500',
      long: '2000-3000',
    };

    // Define article type instructions
    const articleTypeInstructions = {
      tutorial: 'Piš jako praktický návod krok za krokem s konkrétními příklady',
      review: 'Piš jako objektivní recenzi s výhodami a nevýhodami',
      'case-study': 'Piš jako case study s reálnými výsledky a daty',
      news: 'Piš jako aktuální zpravodajský článek',
      guide: 'Piš jako komplexní průvodce pro začátečníky i pokročilé',
      listicle: 'Piš jako seznam bodů/tipů s vysvětlením každého bodu',
    };

    // Construct the prompt
    const systemPrompt = `Jsi expert copywriter specializující se na SEO-optimalizované blog články pro webdesign/development agenturu.

**Důležitá pravidla:**
- Piš ${language === 'cs' ? 'v češtině' : 'v němčině'}
- ${articleTypeInstructions[articleType]}
- Cílová délka: ${wordCounts[length]} slov
- Ton: ${tone === 'professional' ? 'profesionální ale přátelský' : tone === 'casual' ? 'neformální a konverzační' : 'technický s odbornými termíny'}
- Používej praktické příklady a konkrétní data
- Strukturuj obsah s nadpisy (H2, H3)
- Přidej Call-to-Action na konci

**Formát odpovědi - VŽDY použij tento JSON formát:**
\`\`\`json
{
  "title": "SEO-optimalizovaný nadpis (max 60 znaků)",
  "slug": "url-friendly-slug",
  "excerpt": "Přitažlivý perex 150-160 znaků",
  "content": "Hlavní obsah článku v Markdown formátu s ##, ###, odkazy, seznamy, tučným textem atd.",
  "metaDescription": "Meta description pro SEO (max 160 znaků)",
  "keywords": ["klíčové", "slovo", "3-5 slov"]
}
\`\`\``;

    const userPrompt = `Vygeneruj blog článek na téma: **${topic}**

${keywords.length > 0 ? `Klíčová slova k zahrnutí: ${keywords.join(', ')}` : ''}
${targetAudience ? `Cílová skupina: ${targetAudience}` : ''}

Vytvoř kvalitní, SEO-optimalizovaný článek s praktickými informacemi.`;

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    // Extract the response
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Try to parse JSON from response
    let generatedArticle;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/```\n([\s\S]*?)\n```/);
      const jsonText = jsonMatch ? jsonMatch[1] : responseText;
      generatedArticle = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse Claude response as JSON:', parseError);
      // Fallback: Return raw text
      return NextResponse.json({
        success: false,
        error: 'AI vygenerovalo odpověď v nesprávném formátu',
        rawResponse: responseText,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      article: {
        title: generatedArticle.title,
        slug: generatedArticle.slug,
        excerpt: generatedArticle.excerpt,
        content: generatedArticle.content,
        metaDescription: generatedArticle.metaDescription,
        keywords: generatedArticle.keywords || [],
      },
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      },
    });

  } catch (error: any) {
    console.error('Error generating blog article:', error);
    return NextResponse.json(
      {
        error: 'Chyba při generování článku',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
