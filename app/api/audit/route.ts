import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/resend-client";
import { recordAudit } from "@/lib/audits/server";
import { analyzeWebsite } from "@/lib/web-analyzer";

/**
 * PageSpeed Insights first, our own analyzer as the floor.
 *
 * The anonymous PSI quota is shared per IP and is routinely exhausted — a
 * direct call returns 429 with no key at all, which meant the public audit
 * answered "Nepodařilo se analyzovat web. Zkontrolujte URL." and blamed the
 * visitor for our quota. Setting PAGESPEED_API_KEY (the PageSpeed Insights
 * API, free, no billing) restores the real measurement; without it the
 * in-house analyzer still produces a score, so the page is never dead.
 */
const PSI_API = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const PSI_KEY = process.env.PAGESPEED_API_KEY?.trim();

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

interface AuditCategory {
  key: string;
  label: string;
  score: number; // 0-100
}

interface AuditFinding {
  severity: "critical" | "warning";
  title: string;
  recommendation: string;
}

interface AuditResult {
  url: string;
  score: number;
  metrics: AuditMetric[];
  issueCount: number;
  /** The six dimensions the in-house analyzer scores. */
  categories?: AuditCategory[];
  /** What is actually wrong, in words the visitor can act on. */
  findings?: AuditFinding[];
  // Only in email, not returned to client
  issues?: AuditIssue[];
  opportunities?: AuditIssue[];
}

/**
 * Our own measurement of 50 Czech company websites, published at
 * /blog/analyzovali-jsme-50-ceskych-webu-prumerny-pagespeed-43. A score on its
 * own tells a visitor nothing; a score against a benchmark we measured
 * ourselves is the one thing in this report the competition cannot copy.
 */
const BENCHMARK_AVERAGE = 43;
const BENCHMARK_SAMPLE = 50;
const BENCHMARK_URL =
  "https://www.weblyx.cz/blog/analyzovali-jsme-50-ceskych-webu-prumerny-pagespeed-43";

function benchmarkVerdict(score: number): string {
  if (score >= 90) return `To je výrazně nad průměrem českých firemních webů (${BENCHMARK_AVERAGE}/100) — patříte do nejlepších procent.`;
  if (score >= BENCHMARK_AVERAGE + 15) return `To je nad průměrem českých firemních webů, který jsme naměřili na ${BENCHMARK_AVERAGE}/100.`;
  if (score >= BENCHMARK_AVERAGE) return `To je kolem průměru českých firemních webů (${BENCHMARK_AVERAGE}/100) — prostor ke zlepšení tu je.`;
  return `To je pod průměrem českých firemních webů, který jsme naměřili na ${BENCHMARK_AVERAGE}/100.`;
}

const CATEGORY_LABELS: Array<[string, string]> = [
  ["seo", "SEO"],
  ["performance", "Rychlost"],
  ["security", "Bezpečnost"],
  ["accessibility", "Přístupnost"],
  ["social", "Sociální sítě"],
  ["geo", "AI vyhledávání"],
];

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

/** Our own analysis, shaped like a PSI result so the caller cannot tell. */
async function runLocalAudit(url: string): Promise<AuditResult> {
  const a = await analyzeWebsite(url);
  const cat = a.categoryScores;

  const categories: AuditCategory[] = cat
    ? CATEGORY_LABELS.map(([key, label]) => ({
        key,
        label,
        score: Math.round((cat as Record<string, number>)[key] ?? 0),
      }))
    : [];

  // The three headline metrics stay for the compact view; the full six sit
  // alongside them.
  const metrics: AuditMetric[] = categories
    .slice(0, 3)
    .map((c) => ({ label: c.label, value: `${c.score}/100`, score: c.score / 100 }));

  const actionable = a.issues.filter((i) => i.category !== "info");

  const findings: AuditFinding[] = actionable
    .slice(0, 12)
    .map((i) => ({
      severity: i.category === "critical" ? "critical" : "warning",
      title: i.title,
      recommendation: i.recommendation || i.description,
    }));

  const issues: AuditIssue[] = actionable
    .slice(0, 12)
    .map((i) => ({ title: i.title, description: i.recommendation || i.description }));

  return {
    url,
    score: Math.round(a.overallScore),
    metrics,
    categories,
    findings,
    issueCount: a.issueCount.critical + a.issueCount.warning,
    issues,
    opportunities: [],
  };
}

/**
 * One analyzer, one experience.
 *
 * The public audit used to run PageSpeed and show three numbers, while the
 * admin ran the in-house analyzer and got six scored dimensions plus the
 * actual findings. Two tools answering the same question differently is how
 * the two screens drifted apart. The in-house analyzer is now the audit —
 * publicly and internally — so a visitor sees what we see.
 *
 * PageSpeed is kept as an optional refinement: with PAGESPEED_API_KEY set it
 * replaces our estimated speed score with the real Lighthouse measurement.
 * Without a key — the anonymous quota is exhausted and answers 429 — the audit
 * is unaffected.
 */
async function pagespeedScore(url: string): Promise<number | null> {
  if (!PSI_KEY) return null;
  try {
    const res = await fetch(
      `${PSI_API}?url=${encodeURIComponent(url)}&strategy=mobile&category=performance&key=${encodeURIComponent(PSI_KEY)}`,
      { signal: AbortSignal.timeout(45000) }
    );
    if (!res.ok) {
      console.warn(`PageSpeed unavailable (${res.status}); keeping the in-house speed score.`);
      return null;
    }
    const data = await res.json();
    const raw = data?.lighthouseResult?.categories?.performance?.score;
    return typeof raw === "number" ? Math.round(raw * 100) : null;
  } catch (err) {
    console.warn("PageSpeed unreachable; keeping the in-house speed score.", err);
    return null;
  }
}

async function runAudit(url: string): Promise<AuditResult> {
  const [result, psi] = await Promise.all([runLocalAudit(url), pagespeedScore(url)]);

  if (psi === null) return result;

  // Real Lighthouse beats our estimate, so it replaces the speed figure and
  // the overall score is recomputed from the six dimensions it belongs to.
  const categories = (result.categories ?? []).map((c) =>
    c.key === "performance" ? { ...c, score: psi } : c
  );
  const score = categories.length
    ? Math.round(categories.reduce((sum, c) => sum + c.score, 0) / categories.length)
    : result.score;

  return {
    ...result,
    categories,
    score,
    metrics: categories.slice(0, 3).map((c) => ({
      label: c.label,
      value: `${c.score}/100`,
      score: c.score / 100,
    })),
  };
}

function buildEmailHtml(result: AuditResult): string {
  const overallColor = getScoreColor(result.score / 100);

  // All six dimensions, not the three that fit on the page.
  const rows = (result.categories?.length
    ? result.categories.map((c) => ({ label: c.label, value: `${c.score}/100`, score: c.score / 100 }))
    : result.metrics);

  const metricsHtml = rows
    .map(
      (m) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#334155;">${m.label}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;font-weight:600;color:${getScoreColor(m.score)};">${getScoreEmoji(m.score)} ${m.value}</td>
    </tr>`
    )
    .join("");

  // Every finding carries what to do about it. The report used to list titles
  // only — "Obrázky bez ALT atributu" says what, never what next, which is the
  // whole reason someone asked for an audit.
  const findings = result.findings?.length
    ? result.findings.map((f) => ({
        title: f.title,
        advice: f.recommendation,
        critical: f.severity === "critical",
      }))
    : [...(result.issues || []), ...(result.opportunities || [])].map((i) => ({
        title: i.title,
        advice: i.description,
        critical: false,
      }));

  const issuesHtml = findings
    .slice(0, 15)
    .map(
      (f) => `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#334155;">
        <strong style="color:${f.critical ? "#dc2626" : "#d97706"};">${f.critical ? "🔴" : "🟡"} ${f.title}</strong>
        ${f.advice ? `<br><span style="color:#475569;font-size:13px;line-height:1.5;">${f.advice}</span>` : ""}
      </td>
    </tr>`
    )
    .join("");

  const benchmarkHtml = `
    <div style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:12px;padding:16px 18px;margin:0 0 20px;">
      <p style="margin:0 0 6px;font-size:14px;font-weight:600;color:#0f766e;">Jak si stojíte proti trhu</p>
      <p style="margin:0;font-size:14px;line-height:1.6;color:#334155;">
        ${benchmarkVerdict(result.score)}
        Změřili jsme ${BENCHMARK_SAMPLE} českých firemních webů —
        <a href="${BENCHMARK_URL}" style="color:#0d9488;">celá analýza je tady</a>.
      </p>
    </div>`;

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
          Celkové skóre pro<br>
          <strong style="color:#0f172a;">${result.url}</strong>
        </p>
      </div>

      ${benchmarkHtml}

      <!-- Metrics -->
      <h2 style="font-size:18px;color:#0f172a;margin:0 0 16px;padding-bottom:8px;border-bottom:2px solid #14b8a6;">
        📊 Skóre podle kategorií
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
          Školská 660/3, Praha 1 | <a href="https://www.weblyx.cz" style="color:#14b8a6;">weblyx.cz</a>
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
    const { url, email, name } = body;

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

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;

    let result;
    try {
      result = await runAudit(normalizedUrl);
    } catch (err: any) {
      // Someone handing over their site and their address is the strongest
      // signal this business gets. Keep it even when the analysis failed —
      // the lead is real either way.
      await recordAudit({
        url: normalizedUrl,
        email,
        name,
        status: "failed",
        error: err?.message ? String(err.message).slice(0, 300) : "unknown",
        ipAddress,
      });
      throw err;
    }

    // Recorded before the e-mail: the report is a courtesy, the lead is the
    // point, and this used to be thrown away entirely.
    await recordAudit({
      url: normalizedUrl,
      email,
      name,
      score: result.score,
      metrics: result.metrics,
      issueCount: result.issueCount,
      ipAddress,
    });

    // Awaited on purpose. This used to be fire-and-forget, and on Vercel the
    // instance freezes as soon as the response is returned — the request to
    // Resend never finished and no report was ever delivered. Roughly 300ms on
    // a three-second call, and a failure here must not cost the visitor their
    // result, so it stays non-fatal.
    await sendEmail({
      to: email,
      subject: `🔍 Audit webu: ${normalizedUrl} — skóre ${result.score}/100`,
      html: buildEmailHtml(result),
    }).catch((err) => {
      console.error("Failed to send audit email:", err);
      return { success: false as const, error: String(err) };
    });

    // Return partial results to client (no detailed issues)
    return NextResponse.json({
      success: true,
      url: result.url,
      score: result.score,
      metrics: result.metrics,
      categories: result.categories ?? [],
      findings: result.findings ?? [],
      issueCount: result.issueCount,
      benchmark: {
        average: BENCHMARK_AVERAGE,
        sample: BENCHMARK_SAMPLE,
        url: BENCHMARK_URL,
        verdict: benchmarkVerdict(result.score),
      },
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
