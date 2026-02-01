import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/resend-client";

// Google PageSpeed Insights API (free, no key required for basic use)
const PSI_API = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

interface AuditMetric {
  label: string;
  value: string;
  score: number; // 0-1
}

interface AuditIssue {
  title: string;
  description: string;
  savings?: string;
}

interface AuditResult {
  url: string;
  score: number;
  metrics: AuditMetric[];
  issueCount: number;
  // Only in email, not returned to client
  issues?: AuditIssue[];
  opportunities?: AuditIssue[];
}

function getScoreColor(score: number): string {
  if (score >= 0.9) return "#22c55e"; // green
  if (score >= 0.5) return "#f59e0b"; // amber
  return "#ef4444"; // red
}

function getScoreEmoji(score: number): string {
  if (score >= 0.9) return "🟢";
  if (score >= 0.5) return "🟡";
  return "🔴";
}

function getScoreLabel(score: number): string {
  if (score >= 0.9) return "Výborně";
  if (score >= 0.5) return "Průměr";
  return "Potřebuje zlepšit";
}

function formatMs(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)} s`;
  return `${Math.round(ms)} ms`;
}

async function runAudit(url: string): Promise<AuditResult> {
  const apiUrl = `${PSI_API}?url=${encodeURIComponent(url)}&strategy=mobile&category=performance&category=seo&category=best-practices`;

  const res = await fetch(apiUrl, { signal: AbortSignal.timeout(60000) });
  if (!res.ok) {
    throw new Error(`PageSpeed API error: ${res.status}`);
  }

  const data = await res.json();
  const lhr = data.lighthouseResult;
  const perfScore = lhr.categories?.performance?.score ?? 0;
  const seoScore = lhr.categories?.seo?.score ?? 0;
  const bpScore = lhr.categories?.["best-practices"]?.score ?? 0;

  const audits = lhr.audits || {};

  // Key metrics
  const metrics: AuditMetric[] = [
    {
      label: "Výkon (Performance)",
      value: `${Math.round(perfScore * 100)}/100`,
      score: perfScore,
    },
    {
      label: "SEO",
      value: `${Math.round(seoScore * 100)}/100`,
      score: seoScore,
    },
    {
      label: "Best Practices",
      value: `${Math.round(bpScore * 100)}/100`,
      score: bpScore,
    },
    {
      label: "First Contentful Paint",
      value: audits["first-contentful-paint"]?.displayValue || "N/A",
      score: audits["first-contentful-paint"]?.score ?? 0,
    },
    {
      label: "Largest Contentful Paint",
      value: audits["largest-contentful-paint"]?.displayValue || "N/A",
      score: audits["largest-contentful-paint"]?.score ?? 0,
    },
    {
      label: "Cumulative Layout Shift",
      value: audits["cumulative-layout-shift"]?.displayValue || "N/A",
      score: audits["cumulative-layout-shift"]?.score ?? 0,
    },
  ];

  // Collect issues (failed audits)
  const issues: AuditIssue[] = [];
  const opportunities: AuditIssue[] = [];

  for (const [, audit] of Object.entries(audits) as [string, any][]) {
    if (!audit || audit.score === null || audit.score === undefined) continue;
    if (audit.score < 0.5 && audit.title) {
      const item: AuditIssue = {
        title: audit.title,
        description: audit.description?.replace(/<[^>]*>/g, "").slice(0, 200) || "",
        savings: audit.displayValue || undefined,
      };
      if (audit.details?.type === "opportunity") {
        opportunities.push(item);
      } else {
        issues.push(item);
      }
    }
  }

  return {
    url,
    score: Math.round(perfScore * 100),
    metrics,
    issueCount: issues.length + opportunities.length,
    issues,
    opportunities,
  };
}

function buildEmailHtml(result: AuditResult): string {
  const overallColor = getScoreColor(result.score / 100);

  const metricsHtml = result.metrics
    .map(
      (m) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#334155;">${m.label}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;font-weight:600;color:${getScoreColor(m.score)};">${getScoreEmoji(m.score)} ${m.value}</td>
    </tr>`
    )
    .join("");

  const issuesHtml = [...(result.issues || []), ...(result.opportunities || [])]
    .slice(0, 15)
    .map(
      (issue) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#334155;">
        <strong>🔴 ${issue.title}</strong>
        ${issue.savings ? `<br><span style="color:#94a3b8;font-size:12px;">Potenciální úspora: ${issue.savings}</span>` : ""}
      </td>
    </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:16px 16px 0 0;padding:32px;text-align:center;">
      <h1 style="color:#14b8a6;font-size:24px;margin:0 0 8px;">Weblyx</h1>
      <p style="color:#94a3b8;font-size:14px;margin:0;">Bezplatný audit webu</p>
    </div>

    <!-- Content -->
    <div style="background:white;padding:32px;border-radius:0 0 16px 16px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      
      <!-- Score -->
      <div style="text-align:center;margin-bottom:32px;">
        <div style="display:inline-block;width:100px;height:100px;border-radius:50%;border:6px solid ${overallColor};line-height:88px;font-size:36px;font-weight:700;color:${overallColor};">
          ${result.score}
        </div>
        <p style="color:#64748b;font-size:14px;margin:12px 0 0;">
          Performance skóre pro<br>
          <strong style="color:#0f172a;">${result.url}</strong>
        </p>
      </div>

      <!-- Metrics -->
      <h2 style="font-size:18px;color:#0f172a;margin:0 0 16px;padding-bottom:8px;border-bottom:2px solid #14b8a6;">
        📊 Přehled metrik
      </h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:32px;">
        ${metricsHtml}
      </table>

      <!-- Issues -->
      ${
        issuesHtml
          ? `
      <h2 style="font-size:18px;color:#0f172a;margin:0 0 16px;padding-bottom:8px;border-bottom:2px solid #ef4444;">
        ⚠️ Nalezené problémy (${result.issueCount})
      </h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:32px;">
        ${issuesHtml}
      </table>
      `
          : ""
      }

      <!-- CTA -->
      <div style="background:#f0fdfa;border-radius:12px;padding:24px;text-align:center;margin-top:24px;">
        <h3 style="color:#0f172a;font-size:16px;margin:0 0 8px;">Chcete tyto problémy vyřešit?</h3>
        <p style="color:#64748b;font-size:14px;margin:0 0 16px;">
          Náš tým vám pomůže zrychlit web a zlepšit SEO. Nezávazná konzultace zdarma.
        </p>
        <a href="https://www.weblyx.cz/poptavka" style="display:inline-block;padding:12px 32px;background:#14b8a6;color:white;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">
          Nezávazná konzultace →
        </a>
      </div>

      <!-- Footer -->
      <div style="text-align:center;margin-top:32px;padding-top:16px;border-top:1px solid #f1f5f9;">
        <p style="color:#94a3b8;font-size:12px;margin:0;">
          Weblyx | Tvorba webových stránek<br>
          Revoluční 8, Praha 1 | <a href="https://www.weblyx.cz" style="color:#14b8a6;">weblyx.cz</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, email } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL je povinná" }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Zadejte platný email" }, { status: 400 });
    }

    // Normalize URL
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith("http")) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    // Run audit
    const result = await runAudit(normalizedUrl);

    // Send full report via email (fire-and-forget)
    sendEmail({
      to: email,
      subject: `🔍 Audit webu: ${normalizedUrl} — skóre ${result.score}/100`,
      html: buildEmailHtml(result),
    }).catch((err) => console.error("Failed to send audit email:", err));

    // Return partial results to client (no detailed issues)
    return NextResponse.json({
      success: true,
      url: result.url,
      score: result.score,
      metrics: result.metrics.slice(0, 3), // Only top 3 metrics
      issueCount: result.issueCount,
    });
  } catch (error: any) {
    console.error("Audit error:", error);

    if (error.message?.includes("PageSpeed API")) {
      return NextResponse.json(
        { error: "Nepodařilo se analyzovat web. Zkontrolujte URL." },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: "Něco se pokazilo. Zkuste to znovu." },
      { status: 500 }
    );
  }
}
