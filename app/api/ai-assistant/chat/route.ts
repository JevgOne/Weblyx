import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ===========================================
// SYSTEM PROMPT - AI MARKETING AGENCY
// ===========================================

const SYSTEM_PROMPT = `
# AI MARKETING AGENCY

Jsi AI Marketing Agency - kompletní tým specialistů pro řízení Google Ads a Meta Ads kampaní. Nahrazuješ celou marketingovou agenturu.

## TVÉ ROLE (aktivuješ podle potřeby)

1. **ORCHESTRATOR** - Koordinátor týmu, deleguje úkoly
2. **ANALYST** - Analyzuje data, vytváří reporty, identifikuje problémy
3. **STRATEGIST** - Vytváří strategie, definuje cílové skupiny
4. **GOOGLE ADS SPECIALIST** - Expert na Google Ads
5. **META ADS SPECIALIST** - Expert na Facebook/Instagram Ads
6. **CREATIVE DIRECTOR** - Vizuální koncepty, creative briefs
7. **CONTENT WRITER** - Ad copy pro všechny platformy

## JAK PRACUJEŠ

### Při analýze dat:
1. Zkontroluj dostupná data
2. Vypočítej klíčové metriky (CPA, ROAS, CTR)
3. Porovnej s targety z konfigurace
4. Identifikuj winners a losers
5. Navrhni konkrétní akce

### Metriky a jejich hodnocení:
- CTR Search: dobrý > 3%, warning 1.5-3%, špatný < 1.5%
- CTR Display: dobrý > 0.5%, warning 0.2-0.5%, špatný < 0.2%
- CTR Meta Feed: dobrý > 1.5%, warning 0.8-1.5%, špatný < 0.8%
- Quality Score (Google): dobrý ≥ 7, warning 5-6, špatný < 5
- Frequency (Meta): dobrý < 2, warning 2-3, špatný > 3

### Rozhodovací pravidla:
- SCALE UP: ROAS > target * 1.2 po 3+ dny → +20% budget
- SCALE DOWN: ROAS < target * 0.5 po 5+ dní → -30% budget nebo pause
- PAUSE: 50+ clicks a 0 conversions → pausni keyword/ad
- ADD NEGATIVE: 10+ clicks, 0 conversions, irelevantní → přidej negative keyword

## FORMÁT ODPOVĚDÍ

Vždy odpovídej strukturovaně:

### Pro reporty:
📊 **SHRNUTÍ** (3-5 vět)

**KLÍČOVÉ METRIKY**
| Metrika | Hodnota | Target | Status |
|---------|---------|--------|--------|

**DOPORUČENÍ**
🔴 Kritické: [ihned provést]
🟡 Důležité: [tento týden]
🟢 Nice-to-have: [k zvážení]

### Pro analýzy kampaní:
Vždy uveď:
- Co funguje (winners)
- Co nefunguje (losers)
- Konkrétní akce k provedení
- Očekávaný dopad

## ČESKÝ KONTEXT

- Měna: Kč
- Formát čísel: 9 990 Kč (mezera jako oddělovač)
- Benchmarky CZ trh:
  - E-commerce: CPC 5-12 Kč, CPA 200-500 Kč
  - B2B služby: CPC 15-50 Kč, CPA 500-2000 Kč
  - Web development: CPC 20-60 Kč, CPA 800-3000 Kč

## PRAVIDLA

1. Vždy používej data která dostaneš - neodhaduj
2. Pokud chybí data, řekni co potřebuješ
3. Konkrétní čísla > vágní doporučení
4. Každý insight = konkrétní akce
5. Komunikuj česky, srozumitelně, bez zbytečného žargonu
6. Pokud nemáš dost dat pro rozhodnutí, řekni to
`;

// ===========================================
// HELPER FUNCTIONS
// ===========================================

// Fetch marketing data from internal APIs
async function fetchMarketingData(baseUrl: string) {
  const data: {
    google_ads: any[] | null;
    meta_ads: any[] | null;
  } = {
    google_ads: null,
    meta_ads: null,
  };

  try {
    // Google Ads data
    const googleRes = await fetch(`${baseUrl}/api/google-ads/campaigns`, {
      cache: "no-store",
    });
    if (googleRes.ok) {
      const googleData = await googleRes.json();
      if (googleData.success) {
        data.google_ads = googleData.data;
      }
    }
  } catch (e) {
    console.error("Failed to fetch Google Ads:", e);
  }

  try {
    // Meta Ads data
    const metaRes = await fetch(`${baseUrl}/api/meta-ads/campaigns`, {
      cache: "no-store",
    });
    if (metaRes.ok) {
      const metaData = await metaRes.json();
      if (metaData.success) {
        data.meta_ads = metaData.data;
      }
    }
  } catch (e) {
    console.error("Failed to fetch Meta Ads:", e);
  }

  return data;
}

// Format data for AI context
function formatDataForAI(data: { google_ads: any[] | null; meta_ads: any[] | null }, config: any) {
  let context = "";

  // Project config
  if (config) {
    context += `
## KONFIGURACE PROJEKTU
- Průměrná hodnota objednávky (AOV): ${config.averageOrderValue || "nenastaveno"} Kč
- Marže: ${config.grossMarginPercent || "nenastaveno"}%
- Target ROAS: ${config.targetRoas || "nenastaveno"}x
- Target CPA: ${config.targetCpa || "nenastaveno"} Kč
- Měsíční budget: ${config.monthlyBudget || "nenastaveno"} Kč
- Break-even ROAS: ${config.breakEvenRoas || "nenastaveno"}x
- Max CPA: ${config.maxCpa || "nenastaveno"} Kč
`;
  }

  // Google Ads data
  if (data.google_ads && data.google_ads.length > 0) {
    context += `
## GOOGLE ADS DATA

### Kampaně
| Kampaň | Status | Spend | Clicks | Conv | CPA | ROAS |
|--------|--------|-------|--------|------|-----|------|
`;
    data.google_ads.forEach((c: any) => {
      const spend = c.spend || c.cost || 0;
      const conversions = c.conversions || 0;
      const convValue = c.conversionValue || c.conversionsValue || 0;
      const cpa = conversions > 0 ? (spend / conversions).toFixed(0) : "-";
      const roas = spend > 0 ? (convValue / spend).toFixed(2) : "-";
      context += `| ${c.name} | ${c.status} | ${spend.toFixed(0)} Kč | ${c.clicks || 0} | ${conversions} | ${cpa} Kč | ${roas}x |\n`;
    });

    // Souhrn
    const totals = data.google_ads.reduce(
      (acc: any, c: any) => ({
        spend: acc.spend + (c.spend || c.cost || 0),
        clicks: acc.clicks + (c.clicks || 0),
        conversions: acc.conversions + (c.conversions || 0),
        convValue: acc.convValue + (c.conversionValue || c.conversionsValue || 0),
      }),
      { spend: 0, clicks: 0, conversions: 0, convValue: 0 }
    );

    context += `
**Celkem Google Ads:**
- Spend: ${totals.spend.toFixed(0)} Kč
- Clicks: ${totals.clicks}
- Conversions: ${totals.conversions}
- CPA: ${totals.conversions > 0 ? (totals.spend / totals.conversions).toFixed(0) : "-"} Kč
- ROAS: ${totals.spend > 0 ? (totals.convValue / totals.spend).toFixed(2) : "-"}x
`;
  } else {
    context += `
## GOOGLE ADS
Žádná data - buď není připojeno nebo nemáš aktivní kampaně.
`;
  }

  // Meta Ads data
  if (data.meta_ads && data.meta_ads.length > 0) {
    context += `
## META ADS DATA

### Kampaně
| Kampaň | Status | Spend | Reach | Clicks | Conv | CPA | ROAS |
|--------|--------|-------|-------|--------|------|-----|------|
`;
    data.meta_ads.forEach((c: any) => {
      const spend = c.spend || 0;
      const conversions = c.conversions || 0;
      const convValue = c.conversionValue || c.purchaseValue || 0;
      const cpa = conversions > 0 ? (spend / conversions).toFixed(0) : "-";
      const roas = spend > 0 ? (convValue / spend).toFixed(2) : "-";
      context += `| ${c.name} | ${c.status || c.effectiveStatus} | ${spend.toFixed(0)} Kč | ${c.reach || "-"} | ${c.clicks || 0} | ${conversions} | ${cpa} Kč | ${roas}x |\n`;
    });

    // Souhrn
    const totals = data.meta_ads.reduce(
      (acc: any, c: any) => ({
        spend: acc.spend + (c.spend || 0),
        clicks: acc.clicks + (c.clicks || 0),
        conversions: acc.conversions + (c.conversions || 0),
        convValue: acc.convValue + (c.conversionValue || c.purchaseValue || 0),
        reach: acc.reach + (c.reach || 0),
      }),
      { spend: 0, clicks: 0, conversions: 0, convValue: 0, reach: 0 }
    );

    context += `
**Celkem Meta Ads:**
- Spend: ${totals.spend.toFixed(0)} Kč
- Reach: ${totals.reach}
- Clicks: ${totals.clicks}
- Conversions: ${totals.conversions}
- CPA: ${totals.conversions > 0 ? (totals.spend / totals.conversions).toFixed(0) : "-"} Kč
- ROAS: ${totals.spend > 0 ? (totals.convValue / totals.spend).toFixed(2) : "-"}x
`;
  } else {
    context += `
## META ADS
Žádná data - buď není připojeno nebo nemáš aktivní kampaně.
`;
  }

  return context;
}

// ===========================================
// API HANDLERS
// ===========================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context } = body;

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { success: false, error: "Anthropic API key not configured" },
        { status: 500 }
      );
    }

    // Get base URL for internal API calls
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const host = request.headers.get("host") || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;

    // Fetch current data from platforms
    const marketingData = await fetchMarketingData(baseUrl);

    // Format data for AI
    const dataContext = formatDataForAI(marketingData, context?.config);

    // Build user message with context
    const userMessageWithContext = `
${message}

---
# AKTUÁLNÍ DATA (použij pro analýzu)
${dataContext}

# PŘIPOJENÉ PLATFORMY
- Google Ads: ${context?.connections?.google_ads ? "✅ Připojeno" : "❌ Nepřipojeno"}
- Meta Ads: ${context?.connections?.meta_ads ? "✅ Připojeno" : "❌ Nepřipojeno"}
- GA4: ${context?.connections?.ga4 ? "✅ Připojeno" : "❌ Nepřipojeno"}
- GSC: ${context?.connections?.gsc ? "✅ Připojeno" : "❌ Nepřipojeno"}
`;

    // Call Anthropic API
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: userMessageWithContext,
        },
      ],
    });

    // Extract text from response
    const aiResponse = response.content
      .filter((block) => block.type === "text")
      .map((block) => (block as { type: "text"; text: string }).text)
      .join("");

    return NextResponse.json({
      success: true,
      response: aiResponse,
    });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process chat message",
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/ai-assistant/chat",
    methods: ["POST"],
    description: "AI Marketing Assistant chat endpoint",
  });
}
