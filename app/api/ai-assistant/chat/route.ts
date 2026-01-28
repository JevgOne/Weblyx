import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ===========================================
// TYPES
// ===========================================

interface PlatformConnection {
  connected: boolean;
  accountId?: string;
  accountName?: string;
  lastSync?: string;
}

interface Connections {
  googleAds?: PlatformConnection;
  metaAds?: PlatformConnection;
  googleAnalytics?: PlatformConnection;
  searchConsole?: PlatformConnection;
}

interface ProjectConfig {
  name?: string;
  url?: string;
  type?: "ecommerce" | "services" | "lead_gen";
  industry?: string;
  averageOrderValue?: number;
  grossMargin?: number;
  targetRoas?: number;
  targetCpa?: number;
  monthlyBudget?: number;
  language?: "cs" | "en" | "de";
}

interface ChatContext {
  connections?: Connections;
  config?: ProjectConfig;
}

interface ChatRequest {
  message: string;
  context?: ChatContext;
  stream?: boolean;
}

interface ChatResponse {
  success: boolean;
  response?: string;
  error?: string;
}

// ===========================================
// SYSTEM PROMPT
// ===========================================

const MARKETING_AI_SYSTEM_PROMPT = `You are an AI Marketing Assistant - a team of expert marketing professionals helping with digital advertising campaigns.

YOUR ROLE:
You are a complete AI Marketing team with expertise in:

1. **Google Ads Specialist**
   - Campaign structure and optimization
   - Keyword research and match type strategies
   - Ad copy creation (headlines max 30 chars, descriptions max 90 chars)
   - Quality Score optimization
   - Bidding strategies (Target CPA, Target ROAS, Maximize Conversions)
   - Search, Display, Performance Max campaigns
   - Negative keyword management
   - Ad extensions (sitelinks, callouts, structured snippets)

2. **Meta Ads Specialist (Facebook & Instagram)**
   - Campaign objectives (Awareness, Consideration, Conversion)
   - Audience targeting (Interests, Behaviors, Custom, Lookalike)
   - Ad creative best practices (Image specs: 1080x1080, 1080x1350, 1080x1920)
   - Creative fatigue detection (Frequency > 3 with declining CTR)
   - Funnel strategies (TOFU, MOFU, BOFU)
   - A/B testing recommendations
   - Retargeting strategies (Website visitors, Engaged users, ATC)

3. **Campaign Analyst**
   - Performance metrics interpretation (CTR, CPC, CPA, ROAS, CPM)
   - Data-driven recommendations
   - Trend analysis and forecasting
   - Attribution modeling
   - Conversion tracking setup
   - ROI calculations

4. **Budget Strategist**
   - Budget allocation across platforms
   - Scaling strategies (increase 20% if ROAS > target for 3+ days)
   - Pause criteria (50+ clicks, 0 conversions, 5+ days = PAUSE)
   - Break-even ROAS calculation (1 / margin)
   - Daily vs monthly budget planning
   - Channel mix optimization

5. **Creative Director**
   - Ad copy writing in multiple languages
   - Visual concept recommendations
   - Hook creation for video ads (first 3 seconds)
   - Messaging pillars and value propositions
   - Emotional triggers and persuasion techniques
   - Brand voice consistency

RESPONSE GUIDELINES:
- Be concise but thorough
- Provide actionable recommendations
- Use data and metrics to support suggestions
- Structure complex answers with headers and bullet points
- Include specific examples when helpful
- Always consider the user's context (budget, industry, goals)
- For ad copy, always respect character limits:
  - Google Headlines: max 30 characters
  - Google Descriptions: max 90 characters
  - Meta Primary Text: ideally under 125 characters
  - Meta Headlines: max 40 characters

PERFORMANCE THRESHOLDS:
- Good CTR (Search): > 3%
- Good CTR (Display/Meta): > 1%
- Warning CPA: > target x 1.2
- Critical ROAS: < break-even ROAS
- Scaling threshold: ROAS > target x 1.2 for 3+ days
- Creative fatigue: Frequency > 3 with declining CTR

LANGUAGE:
- Respond in the same language the user writes in
- Default to Czech if context indicates a Czech market
- Technical terms can remain in English (CTR, CPC, ROAS, etc.)

Remember: You are here to help marketers succeed. Be helpful, specific, and data-driven.`;

// ===========================================
// HELPER FUNCTIONS
// ===========================================

function buildContextPrompt(context?: ChatContext): string {
  if (!context) return "";

  const parts: string[] = [];

  // Add connection status
  if (context.connections) {
    const connectionStatus: string[] = [];

    if (context.connections.googleAds?.connected) {
      connectionStatus.push(`Google Ads: Connected (${context.connections.googleAds.accountName || context.connections.googleAds.accountId})`);
    }
    if (context.connections.metaAds?.connected) {
      connectionStatus.push(`Meta Ads: Connected (${context.connections.metaAds.accountName || context.connections.metaAds.accountId})`);
    }
    if (context.connections.googleAnalytics?.connected) {
      connectionStatus.push(`Google Analytics: Connected`);
    }
    if (context.connections.searchConsole?.connected) {
      connectionStatus.push(`Search Console: Connected`);
    }

    if (connectionStatus.length > 0) {
      parts.push(`[Connected Platforms]\n${connectionStatus.join("\n")}`);
    }
  }

  // Add project config
  if (context.config) {
    const config = context.config;
    const configDetails: string[] = [];

    if (config.name) configDetails.push(`Project: ${config.name}`);
    if (config.url) configDetails.push(`Website: ${config.url}`);
    if (config.type) configDetails.push(`Business Type: ${config.type}`);
    if (config.industry) configDetails.push(`Industry: ${config.industry}`);
    if (config.averageOrderValue) configDetails.push(`AOV: ${config.averageOrderValue} CZK`);
    if (config.grossMargin) configDetails.push(`Gross Margin: ${(config.grossMargin * 100).toFixed(0)}%`);
    if (config.targetRoas) configDetails.push(`Target ROAS: ${config.targetRoas}x`);
    if (config.targetCpa) configDetails.push(`Target CPA: ${config.targetCpa} CZK`);
    if (config.monthlyBudget) configDetails.push(`Monthly Budget: ${config.monthlyBudget} CZK`);
    if (config.language) configDetails.push(`Language: ${config.language.toUpperCase()}`);

    // Calculate derived metrics
    if (config.grossMargin && config.grossMargin > 0) {
      const breakEvenRoas = 1 / config.grossMargin;
      configDetails.push(`Break-even ROAS: ${breakEvenRoas.toFixed(2)}x`);
    }

    if (configDetails.length > 0) {
      parts.push(`[Project Configuration]\n${configDetails.join("\n")}`);
    }
  }

  return parts.length > 0 ? `\n\n${parts.join("\n\n")}` : "";
}

// ===========================================
// API HANDLERS
// ===========================================

export async function POST(request: NextRequest): Promise<NextResponse<ChatResponse>> {
  try {
    const body: ChatRequest = await request.json();
    const { message, context, stream = false } = body;

    // Validate request
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Message is required and must be a non-empty string",
        },
        { status: 400 }
      );
    }

    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "Anthropic API key is not configured",
        },
        { status: 500 }
      );
    }

    // Build the user message with context
    const contextPrompt = buildContextPrompt(context);
    const userMessage = contextPrompt
      ? `${message}${contextPrompt}`
      : message;

    // Handle streaming response
    if (stream) {
      const streamResponse = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        temperature: 0.7,
        system: MARKETING_AI_SYSTEM_PROMPT,
        stream: true,
        messages: [
          {
            role: "user",
            content: userMessage,
          },
        ],
      });

      // Create a ReadableStream for the response
      const encoder = new TextEncoder();
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const event of streamResponse) {
              if (
                event.type === "content_block_delta" &&
                event.delta.type === "text_delta"
              ) {
                const text = event.delta.text;
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
                );
              }
            }
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return new NextResponse(readableStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      }) as NextResponse<ChatResponse>;
    }

    // Non-streaming response
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      temperature: 0.7,
      system: MARKETING_AI_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    // Extract text response
    const textContent = response.content.find((block) => block.type === "text");
    const responseText = textContent?.type === "text" ? textContent.text : "";

    return NextResponse.json({
      success: true,
      response: responseText,
    });
  } catch (error: unknown) {
    console.error("AI Assistant chat error:", error);

    // Handle Anthropic API errors
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        {
          success: false,
          error: `API Error: ${error.message}`,
        },
        { status: error.status || 500 }
      );
    }

    // Handle other errors
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/ai-assistant/chat",
    methods: ["POST"],
    description: "AI Marketing Assistant chat endpoint",
  });
}
