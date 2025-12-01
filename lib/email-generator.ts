// Email Generation using Google Gemini API
import { GoogleGenerativeAI } from '@google/generative-ai';
import { EmailGenerationPrompt, EmailGenerationResult } from '@/types/lead-generation';
import { WebAnalysisResult } from '@/types/cms';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || 'AIzaSyAUKemEjooWExY-em3ygdg8JWq-BN82XQ4';

/**
 * Generate personalized email using Google Gemini API
 */
export async function generateEmail(prompt: EmailGenerationPrompt): Promise<EmailGenerationResult> {
  const { companyName, website, analysisResult, industry } = prompt;

  // Build context from analysis results
  const issues = analysisResult.issues.filter(i => i.category === 'critical' || i.category === 'warning');
  const issuesList = issues.map(i => `- ${i.title}: ${i.description}`).join('\n');

  // Create prompt for Gemini
  const geminiPrompt = `Jsi obchodní představitel webové agentury Weblyx. Tvým úkolem je napsat krátký, přátelský a personalizovaný email pro potenciálního klienta.

**Informace o klientovi:**
- Název firmy: ${companyName}
- Website: ${website || 'neuveden'}
- Obor: ${industry || 'neuveden'}

**Výsledky analýzy jejich webu:**
- Celkové SEO skóre: ${analysisResult.overallScore}/100
- Počet kritických problémů: ${analysisResult.issueCount.critical}
- Počet varování: ${analysisResult.issueCount.warning}
- Načítací čas: ${analysisResult.technical.loadTime}ms
- Mobilní responzivita: ${analysisResult.technical.mobileResponsive ? 'Ano' : 'Ne'}
- SSL certifikát: ${analysisResult.technical.hasSSL ? 'Ano' : 'Ne'}

**Hlavní problémy:**
${issuesList || '- Žádné velké problémy nenalezeny'}

**Úkol:**
Napiš krátký (max 150 slov), přátelský email, který:
1. Představí Weblyx jako moderní webovou agenturu
2. Zmíní 2-3 konkrétní problémy z analýzy jejich webu
3. Ukáže konkrétní dopady těchto problémů (např. ztracení zákazníků, horší SEO)
4. Nabídne nezávaznou konzultaci zdarma
5. Zakončí call-to-action s odkazem na ${website ? 'https://weblyx.cz/poptavka' : 'naši nabídku'}

**Styl:**
- Přátelský, profesionální tón
- Bez agresivního prodeje
- Konkrétní fakta z analýzy
- Krátké věty, snadná čitelnost

**Formát odpovědi:**
Vrať odpověď POUZE ve formátu JSON:
{
  "subject": "Předmět emailu (max 60 znaků)",
  "body": "Tělo emailu"
}

DŮLEŽITÉ: Nepoužívej markdown formátování. Prostý text pouze.`;

  try {
    // Use GoogleGenerativeAI library
    const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
      }
    });

    const result = await model.generateContent(geminiPrompt);
    const response = await result.response;

    // Extract generated text
    const generatedText = response.text();

    if (!generatedText) {
      throw new Error('No text generated from Gemini API');
    }

    // Parse JSON response
    let parsedResponse;
    try {
      // Try to find JSON in the response (sometimes Gemini wraps it in markdown)
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        parsedResponse = JSON.parse(generatedText);
      }
    } catch (parseError) {
      // Fallback: treat as plain text
      console.warn('Failed to parse JSON from Gemini response, using fallback');
      parsedResponse = {
        subject: `Zlepšení webu ${companyName}`,
        body: generatedText,
      };
    }

    // Calculate confidence based on analysis score
    // Lower score = more issues = higher confidence in our pitch
    const confidence = Math.min(100, Math.max(50, 100 - analysisResult.overallScore));

    return {
      subject: parsedResponse.subject || `Zlepšení webu ${companyName}`,
      body: parsedResponse.body || generatedText,
      confidence,
    };
  } catch (error: any) {
    console.error('Error generating email:', error);

    // Fallback email if API fails
    return {
      subject: `Zrychlení webu ${companyName}`,
      body: `Dobrý den,

narazil jsem na web ${website || companyName} a všiml jsem si několika problémů, které vás mohou stát zákazníky:

- Načítání trvá ${analysisResult.technical.loadTime}ms (ideální je pod 2000ms)
- SEO skóre: ${analysisResult.overallScore}/100
- ${analysisResult.issueCount.critical} kritických problémů

Jsme Weblyx – moderní webová agentura. Specializujeme se na rychlé weby postavené na Next.js místo WordPressu.

Zajímala by vás nezávazná analýza a konzultace zdarma?

Můžete odpovědět na tento email nebo navštívit: https://weblyx.cz/poptavka

S pozdravem,
Tým Weblyx`,
      confidence: 60,
    };
  }
}

/**
 * Generate email subject line only (faster)
 */
export async function generateEmailSubject(companyName: string, score: number): Promise<string> {
  const subjects = [
    `${companyName} – zrychlení webu o 50%`,
    `Web ${companyName} má ${Math.max(0, 100 - score)} problémů`,
    `${companyName}: SEO analýza zdarma`,
    `Jak zlepšit web ${companyName}`,
    `${companyName} – web za týden místo měsíce`,
  ];

  // Pick random subject
  return subjects[Math.floor(Math.random() * subjects.length)];
}
