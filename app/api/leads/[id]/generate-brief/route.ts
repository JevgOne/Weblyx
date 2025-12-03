import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { turso } from "@/lib/turso";

/**
 * Generate AI-ready project brief from lead data
 * This creates a comprehensive brief that can be used as input for AI tools
 */
function buildBriefPrompt(leadData: any): string {
  return `You are a professional project manager creating a comprehensive project brief for a web development project.

Based on the client's form submission, create a detailed, structured brief that can be used as input for AI development tools.

CLIENT FORM DATA:
==============

PROJECT TYPE: ${leadData.projectType}
COMPANY: ${leadData.companyName}
DESCRIPTION: ${leadData.businessDescription}

PROJECT DETAILS:
- Purpose: ${leadData.projectDetails?.purpose || 'not specified'}
- Target Audience: ${leadData.projectDetails?.targetAudience || 'not specified'}
- Main User Actions: ${leadData.projectDetails?.mainActions?.join(', ') || 'not specified'}
- Required Sections: ${leadData.projectDetails?.sections?.join(', ') || 'not specified'}
- Content Status: ${leadData.projectDetails?.hasContent || 'not specified'}
- Content Notes: ${leadData.projectDetails?.contentNotes || 'none'}

FEATURES NEEDED:
${leadData.features?.join(', ') || 'not specified'}

DESIGN PREFERENCES:
- Primary Color: ${leadData.designPreferences?.colors?.primary || 'not specified'}
- Secondary Color: ${leadData.designPreferences?.colors?.secondary || 'not specified'}
- Accent Color: ${leadData.designPreferences?.colors?.accent || 'not specified'}
- Style: ${leadData.designPreferences?.style || 'not specified'}
- Inspiration: ${leadData.designPreferences?.inspiration || 'none'}
- Must Have Features: ${leadData.designPreferences?.mustHave?.join(', ') || 'not specified'}
- Expectations: ${leadData.designPreferences?.expectations || 'not specified'}

TIMELINE: ${leadData.timeline}
BUDGET: ${leadData.budget}

TASK:
Create a comprehensive project brief in JSON format following this structure:

{
  "projectOverview": {
    "title": "string - catchy project title",
    "summary": "string - 2-3 sentence executive summary",
    "businessGoals": ["string"] - list of 3-5 main business objectives
  },
  "targetAudience": {
    "primaryAudience": "string - detailed description",
    "demographics": {
      "age": "string",
      "location": "string",
      "interests": "string"
    },
    "painPoints": ["string"] - list of 3-5 problems they face,
    "needs": ["string"] - list of 3-5 things they need from the website
  },
  "websiteGoals": {
    "primary": "string - main goal",
    "secondary": ["string"] - list of 3-5 secondary goals,
    "kpis": ["string"] - list of 3-5 measurable KPIs
  },
  "functionalRequirements": {
    "mustHave": ["string"] - critical features,
    "shouldHave": ["string"] - important but not critical,
    "niceToHave": ["string"] - optional features
  },
  "contentStrategy": {
    "contentStatus": "string - ready/partial/needed",
    "contentNeeds": ["string"] - list of content that needs to be created,
    "toneOfVoice": "string - professional/friendly/technical/etc",
    "keyMessages": ["string"] - 3-5 key messages to communicate
  },
  "designDirection": {
    "visualStyle": "string - modern/classic/minimal/bold/etc",
    "colorPalette": {
      "primary": "string - hex code",
      "secondary": "string - hex code",
      "accent": "string - hex code",
      "rationale": "string - why these colors fit the brand"
    },
    "typography": {
      "style": "string - modern/classic/playful/etc",
      "suggestions": "string - font pairing suggestions"
    },
    "imageStyle": "string - what kind of photography/illustrations to use",
    "inspirationAnalysis": "string - analysis of provided inspiration if any"
  },
  "siteStructure": {
    "pages": [
      {
        "name": "string",
        "purpose": "string",
        "keyContent": "string",
        "priority": "high/medium/low"
      }
    ],
    "userJourneys": [
      {
        "persona": "string",
        "goal": "string",
        "steps": ["string"] - journey steps
      }
    ]
  },
  "technicalConsiderations": {
    "platform": "string - Next.js/WordPress/etc recommendation",
    "hostingNeeds": "string",
    "integrations": ["string"] - required third-party integrations,
    "securityRequirements": ["string"]
  },
  "contentOutline": {
    "homepage": {
      "heroHeadline": "string",
      "heroSubheadline": "string",
      "heroCTA": "string",
      "sections": ["string"] - list of section names
    },
    "aboutPage": {
      "keyPoints": ["string"] - main things to communicate
    },
    "servicesProducts": {
      "offerings": ["string"] - list of services/products to highlight
    }
  },
  "callsToAction": {
    "primary": "string - main CTA",
    "secondary": ["string"] - alternative CTAs,
    "placement": "string - where CTAs should appear"
  },
  "timeline": {
    "urgency": "string - asap/normal/flexible",
    "suggestedPhases": [
      {
        "phase": "string",
        "duration": "string",
        "deliverables": ["string"]
      }
    ]
  },
  "successCriteria": {
    "launchCriteria": ["string"] - what defines a successful launch,
    "postLaunchMetrics": ["string"] - metrics to track after launch
  },
  "aiImplementationPrompt": "string - a detailed, ready-to-use prompt that can be given to AI development tools (v0, bolt.new, cursor) to start building this project. Should be comprehensive and include all key requirements, design direction, and technical specifications in a format optimized for AI code generation."
}

IMPORTANT INSTRUCTIONS:
1. BE EXTREMELY DETAILED - This brief should be 5-10 pages long when printed
2. USE ALL FORM DATA - Incorporate EVERY SINGLE piece of information the client provided
3. EXPAND ON EVERYTHING - Don't just list features, write 3-5 sentences for EACH feature explaining WHY it's needed, HOW it should work, and WHAT the user experience should be
4. SPECIFIC EXAMPLES - Provide concrete examples for EVERY section (e.g., actual headline suggestions with 3-5 variations, specific user journey steps with exact button labels and copy, detailed wireframe descriptions)
5. TECHNICAL DEPTH - Include implementation details with code examples, API specifications, database schema designs
6. AI IMPLEMENTATION PROMPT - Must be at least 1500-2500 words (about 3-4 pages), extremely detailed, ready to copy-paste into v0/cursor/bolt

Example of good vs bad:
❌ BAD: "Contact form with validation"
✅ GOOD: "Multi-step contact form (3 steps: Personal Info → Project Details → Confirmation) with real-time validation including:
- Step 1: Name (required, min 2 chars), Email (required, RFC 5322 validation with typo suggestions for common domains like gmial.com→gmail.com), Phone (optional, auto-formatting to +420 XXX XXX XXX format)
- Step 2: Project type dropdown (Web/E-shop/Landing/Other), Budget range slider (10k-500k Kč), Timeline picker (ASAP/1-3 months/3-6 months/Flexible), Message textarea (min 20 chars, max 1000 chars, character counter)
- Step 3: Preview all data, GDPR consent checkbox with link to privacy policy, File upload for attachments (drag & drop + click, max 5MB per file, max 3 files, PDF/JPG/PNG only, show upload progress bar, thumbnail preview for images)
- Success page with confirmation number, email receipt sent to both client and admin@weblyx.cz, integration with Turso database to store lead, automated Slack notification to #new-leads channel
- Error handling: field-level errors with red borders and specific messages, form-level errors with toast notifications, retry mechanism for failed API calls, offline detection with queue system
- Styling: Matches brand colors (Teal #14B8A6 primary, white background, soft shadows), smooth transitions between steps, loading states with skeleton screens, success animation with confetti effect"

The aiImplementationPrompt MUST include ALL of these sections in extreme detail:

**1. PROJECT OVERVIEW (200-300 words)**
- Complete project description with business context
- Target audience demographics and psychographics
- Key success metrics (specific numbers like "reduce bounce rate to <40%", "increase conversion by 25%")
- Competitive analysis (what competitors do and how this will be different/better)

**2. COMPLETE TECH STACK (150-200 words)**
- Framework: Next.js 15.x with App Router, TypeScript 5.x, React 18.x Server Components
- Styling: Tailwind CSS 4.x with custom design system, CSS variables for theming, Framer Motion for animations
- Database: Specify schema with exact table names, fields, data types, relationships, indexes
- APIs: List all endpoints with HTTP methods, request/response formats, authentication
- Third-party: Exact service names with API keys needed (Google Analytics, Facebook Pixel, etc.)
- Hosting: Vercel with specific config (edge functions, ISR settings, environment variables)
- Performance: Image optimization (next/image), lazy loading, code splitting strategy, bundle size targets

**3. PAGE-BY-PAGE BREAKDOWN (400-600 words)**
For EACH page, include:
- Exact URL path (e.g., /sluzby, /portfolio/[slug])
- Complete component tree (Header > Hero > Features > CTA > Footer)
- Detailed component specifications:
  * Hero: exact copy for H1 (3 variations), H2, CTA button text, background image specs (1920x1080px, WebP format, < 200KB)
  * Every section with exact content structure, image placements, button labels
- Responsive breakpoints: mobile (< 640px), tablet (640-1024px), desktop (> 1024px)
- Animations: entrance animations (fade-in, slide-up), hover states, scroll-triggered effects
- Loading states: skeleton screens for each component, placeholder content
- SEO meta: exact title (< 60 chars), description (< 160 chars), OG tags, structured data (JSON-LD)

**4. DESIGN SYSTEM (300-400 words)**
- Color palette:
  * Primary: #HEX (usage: CTA buttons, links, icons)
  * Secondary: #HEX (usage: backgrounds, borders)
  * Accent: #HEX (usage: highlights, badges)
  * Neutral: Gray scale with 9 shades (#HEX for each)
  * Semantic: Success (#HEX), Error (#HEX), Warning (#HEX), Info (#HEX)
- Typography system:
  * Headings: Font family (e.g., Inter), weights (400/600/700), sizes for each level (H1: 48px/56px/64px for mobile/tablet/desktop, line-height: 1.2, letter-spacing: -0.02em)
  * Body: Font family, size (16px/18px), line-height (1.6), paragraph spacing
  * Code: Monospace font for technical content
- Spacing system: 4px base unit, scale (4/8/12/16/24/32/48/64/96/128px)
- Border radius: sm (4px), md (8px), lg (12px), xl (16px), full (9999px)
- Shadows: 4 levels with exact CSS values
- Button variants: Primary, Secondary, Outline, Ghost, Danger (with exact styles for each state: default, hover, active, disabled, loading)

**5. FEATURES & FUNCTIONALITY (400-600 words)**
For EACH feature, write detailed specification:
- User story: "As a [user type], I want to [action] so that [benefit]"
- Acceptance criteria: 5-10 specific, testable requirements
- User flow: Step-by-step interaction with exact screen states
- Edge cases: What happens when errors occur, empty states, loading, offline
- API requirements: Endpoint URL, method, request body schema, response schema, error codes
- Database impact: Which tables, what queries, indexing strategy
- Performance target: Max load time (e.g., "< 2s on 3G"), interaction speed (e.g., "< 100ms response")

**6. CONTENT STRATEGY (200-300 words)**
- Exact copy for all static content (headlines, subheadlines, button labels)
- Microcopy for forms (placeholder text, error messages, success messages)
- Tone of voice examples (3-5 before/after examples showing the desired style)
- SEO content requirements (keyword targets, content length, internal linking strategy)
- Image requirements (exact dimensions, file formats, compression targets, alt text guidelines)

**7. IMPLEMENTATION STEPS (200-300 words)**
Ordered list of development phases:
1. Setup (exact commands to run, file structure to create)
2. Component development (order to build components)
3. API integration (exact endpoints to implement)
4. Testing checklist (20+ specific test cases)
5. Deployment process (exact commands, environment variables needed)

Be extremely specific. Write as if the developer has NEVER seen this project before and needs EVERY detail spelled out. Use actual examples, real numbers, specific measurements, exact code snippets where helpful.`;
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Lead ID is required" },
        { status: 400 }
      );
    }

    // Get lead data from Turso
    const dbResult = await turso.execute({
      sql: 'SELECT * FROM leads WHERE id = ?',
      args: [id]
    });

    if (dbResult.rows.length === 0) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const row = dbResult.rows[0] as any;

    // Parse JSON fields
    const parseJSON = (field: any) => {
      if (!field) return null;
      try {
        return typeof field === 'string' ? JSON.parse(field) : field;
      } catch {
        return field;
      }
    };

    const leadData = {
      id: row.id,
      projectType: row.project_type,
      companyName: row.company,
      businessDescription: row.business_description,
      projectDetails: parseJSON(row.project_details),
      features: parseJSON(row.features),
      designPreferences: parseJSON(row.design_preferences),
      budget: row.budget_range,
      timeline: row.timeline,
    };

    // Use GoogleGenerativeAI library (stable approach)
    const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 8192,
      }
    });

    const prompt = buildBriefPrompt(leadData);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response (remove markdown if present)
    let brief;
    try {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      const jsonText = jsonMatch ? jsonMatch[1] : text;
      brief = JSON.parse(jsonText);
    } catch (e) {
      console.error("Failed to parse Gemini response as JSON:", e);
      // If JSON parsing fails, return the raw text
      brief = {
        rawResponse: text,
        error: "Failed to parse structured response",
      };
    }

    // Save brief to Turso
    await turso.execute({
      sql: `UPDATE leads
            SET ai_brief = ?,
                brief_generated_at = unixepoch(),
                updated_at = unixepoch()
            WHERE id = ?`,
      args: [JSON.stringify(brief), id]
    });

    // 📧 Trigger client proposal email in background (don't await)
    // This sends the email with AI design + brief to the client
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl?.origin || 'http://localhost:3000';
    fetch(`${siteUrl}/api/leads/${id}/send-proposal`, {
      method: "POST",
    })
      .then((res) => {
        if (res.ok) {
          console.log("✅ Client proposal email triggered");
        } else {
          console.warn("⚠️ Client proposal email failed:", res.statusText);
        }
      })
      .catch((err) => {
        console.warn("⚠️ Client proposal email error:", err);
      });

    return NextResponse.json({
      success: true,
      brief,
      leadId: id,
    });
  } catch (error: any) {
    console.error("❌ Error generating brief:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate brief",
      },
      { status: 500 }
    );
  }
}
