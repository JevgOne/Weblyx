import { analyzeWebsite } from "@/lib/web-analyzer";
import { CHECK_GROUPS, runChecks, type AuditCheck } from "@/lib/audits/checks";

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

export interface AuditResult {
  url: string;
  score: number;
  metrics: AuditMetric[];
  issueCount: number;
  /** The six dimensions the in-house analyzer scores. */
  categories?: AuditCategory[];
  /** What is actually wrong, in words the visitor can act on. */
  findings?: AuditFinding[];
  /** Yes/no checks: AI visibility, Google, mobile, trust (lib/audits/checks). */
  checks?: AuditCheck[];
  /**
   * Where the speed score came from: Google Lighthouse, or our own estimate
   * and why — "no-key", "psi-403", "psi-timeout". Without it a missing key and
   * a failing API look identical from outside.
   */
  speedSource?: string;
  /** Lighthouse lab figures on mobile, only when PageSpeed answered. */
  vitals?: Array<{ label: string; value: string; good: boolean }>;
  // Only in email, not returned to client
  issues?: AuditIssue[];
  opportunities?: AuditIssue[];
}

export interface AuditOffer {
  headline: string;
  body: string;
  cta: string;
}

/**
 * What to do about it, priced. The report used to end on "Nezávazná
 * konzultace" — a visitor who has just learned their site scores 38 wants to
 * know what fixing it costs, and a number is what turns the audit into an
 * enquiry. Prices are the live packages; ours are final (no VAT on top).
 */
export function offerFor(result: Pick<AuditResult, "score" | "checks">): AuditOffer {
  const failed = (result.checks ?? []).filter((c) => c.ok === false).length;
  if (result.score < 60 || failed >= 8) {
    return {
      headline: "Vyplatí se nový web",
      body:
        `Oprav je tolik, že nový web vyjde levněji a rychleji než záplatování. ` +
        `Landing page za 7 990 Kč, web o 3–5 stránkách za 9 990 Kč, hotovo za 3–7 dní — ` +
        `a všechno z kontroly výše na něm bude splněné. Ceny jsou konečné, nejsme plátci DPH.`,
      cta: "Chci nový web",
    };
  }
  if (failed > 0) {
    return {
      headline: `Doplníme ${failed} ${failed === 1 ? "věc, která chybí" : failed < 5 ? "věci, které chybí" : "věcí, které chybí"}`,
      body:
        `Web je v dobrém základu. Chybějící body z kontroly doplníme na současném webu — ` +
        `napište nám a do 24 hodin pošleme pevnou cenu.`,
      cta: "Chci cenu za opravu",
    };
  }
  return {
    headline: "Web je v dobré kondici",
    body: "Další krok je dostat se výš ve vyhledávání a v odpovědích AI asistentů. Rádi s vámi probereme, kde je prostor.",
    cta: "Nezávazná konzultace",
  };
}

/**
 * Our own measurement of 50 Czech company websites, published at
 * /blog/analyzovali-jsme-50-ceskych-webu-prumerny-pagespeed-43. A score on its
 * own tells a visitor nothing; a score against a benchmark we measured
 * ourselves is the one thing in this report the competition cannot copy.
 */
export const BENCHMARK_AVERAGE = 43;
export const BENCHMARK_SAMPLE = 50;
export const BENCHMARK_URL =
  "https://www.weblyx.cz/blog/analyzovali-jsme-50-ceskych-webu-prumerny-pagespeed-43";

export function benchmarkVerdict(score: number): string {
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
  // The checklist never fails the audit: a robots.txt that times out is a
  // missing line in the report, not an error page for the visitor.
  const checks = await runChecks(a).catch((err) => {
    console.warn("Audit checks failed:", err);
    return [] as AuditCheck[];
  });
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
    checks,
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
interface PsiResult {
  score: number;
  vitals: Array<{ label: string; value: string; good: boolean }>;
}

/** Lighthouse's own pass marks for the lab figures it reports. */
const VITALS: Array<[audit: string, label: string, good: (v: number) => boolean]> = [
  ["largest-contentful-paint", "Načtení hlavního obsahu (LCP)", (v) => v <= 2500],
  ["first-contentful-paint", "První zobrazení (FCP)", (v) => v <= 1800],
  ["total-blocking-time", "Zaseknutí stránky (TBT)", (v) => v <= 200],
  ["cumulative-layout-shift", "Poskakování obsahu (CLS)", (v) => v <= 0.1],
];

async function pagespeedScore(url: string): Promise<PsiResult | string> {
  if (!PSI_KEY) return "no-key";
  try {
    const res = await fetch(
      `${PSI_API}?url=${encodeURIComponent(url)}&strategy=mobile&category=performance&key=${encodeURIComponent(PSI_KEY)}`,
      { signal: AbortSignal.timeout(45000) }
    );
    if (!res.ok) {
      console.warn(`PageSpeed unavailable (${res.status}); keeping the in-house speed score.`, (await res.text()).slice(0, 300));
      return `psi-${res.status}`;
    }
    const data = await res.json();
    const raw = data?.lighthouseResult?.categories?.performance?.score;
    if (typeof raw !== "number") return "psi-no-score";
    const audits = data?.lighthouseResult?.audits ?? {};
    const vitals = VITALS.flatMap(([id, label, good]) => {
      const a = audits[id];
      return typeof a?.numericValue === "number" && a.displayValue
        ? [{ label, value: String(a.displayValue).replace(/\u00a0/g, " "), good: good(a.numericValue) }]
        : [];
    });
    return { score: Math.round(raw * 100), vitals };
  } catch (err: any) {
    console.warn("PageSpeed unreachable; keeping the in-house speed score.", err);
    return err?.name === "TimeoutError" ? "psi-timeout" : "psi-unreachable";
  }
}

export async function runAudit(url: string): Promise<AuditResult> {
  const [result, psi] = await Promise.all([runLocalAudit(url), pagespeedScore(url)]);

  if (typeof psi === "string") return { ...result, speedSource: `estimate:${psi}` };

  // Real Lighthouse beats our estimate, so it replaces the speed figure and
  // the overall score is recomputed from the six dimensions it belongs to.
  const categories = (result.categories ?? []).map((c) =>
    c.key === "performance" ? { ...c, score: psi.score } : c
  );
  const score = categories.length
    ? Math.round(categories.reduce((sum, c) => sum + c.score, 0) / categories.length)
    : result.score;

  return {
    ...result,
    vitals: psi.vitals,
    speedSource: "lighthouse",
    categories,
    score,
    metrics: categories.slice(0, 3).map((c) => ({
      label: c.label,
      value: `${c.score}/100`,
      score: c.score / 100,
    })),
  };
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * `intro` is for reports staff send from the admin panel. The visitor on
 * /audit asked for the report; a prospect we looked up did not, so the mail
 * has to say who is writing and why before it shows a score.
 */
export function buildEmailHtml(result: AuditResult, options: { intro?: string } = {}): string {
  const overallColor = getScoreColor(result.score / 100);

  const introHtml = options.intro
    ? `<p style="margin:0 0 28px;font-size:15px;line-height:1.65;color:#334155;">${escapeHtml(options.intro).replace(/\n/g, "<br>")}</p>`
    : "";

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

  // Most people read the top of a report and stop. The three things worth
  // fixing first go right under the score, so that reader still leaves with
  // something to act on. Critical findings lead; failed checks fill the rest.
  const failedChecks = (result.checks ?? [])
    .filter((c) => c.ok === false)
    .map((c) => ({ title: escapeHtml(c.label), advice: escapeHtml(c.fix) }));
  const priorities = [
    ...findings.filter((f) => f.critical),
    ...findings.filter((f) => !f.critical),
    ...failedChecks.filter((c) => !findings.some((f) => f.title === c.title)),
  ].slice(0, 3);

  const prioritiesHtml = priorities.length
    ? `
      <h2 style="font-size:18px;color:#0f172a;margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid #14b8a6;">
        🎯 ${priorities.length === 1 ? "Co opravit jako první" : `${priorities.length} věci, které opravit jako první`}
      </h2>
      <table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:32px;">
        ${priorities
          .map(
            (p, i) => `
        <tr>
          <td width="34" valign="top" style="width:34px;padding:10px 0;">
            <div style="width:24px;height:24px;border-radius:12px;background:#14b8a6;color:#ffffff;font-size:13px;font-weight:700;line-height:24px;text-align:center;">${i + 1}</div>
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#334155;">
            <strong style="color:#0f172a;">${p.title}</strong>
            ${p.advice ? `<br><span style="color:#475569;font-size:13px;line-height:1.5;">${p.advice}</span>` : ""}
          </td>
        </tr>`
          )
          .join("")}
      </table>`
    : "";

  const benchmarkHtml = `
    <div style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:12px;padding:16px 18px;margin:0 0 20px;">
      <p style="margin:0 0 6px;font-size:14px;font-weight:600;color:#0f766e;">Jak si stojíte proti trhu</p>
      <p style="margin:0;font-size:14px;line-height:1.6;color:#334155;">
        ${benchmarkVerdict(result.score)}
        Změřili jsme ${BENCHMARK_SAMPLE} českých firemních webů —
        <a href="${BENCHMARK_URL}" style="color:#0d9488;">celá analýza je tady</a>.
      </p>
    </div>`;

  // The yes/no checklist, grouped. Details can quote the audited site (schema
  // types, bot names), so they are escaped like any other foreign text.
  const checks = result.checks ?? [];
  const checksHtml = CHECK_GROUPS.map((g) => {
    const rows = checks.filter((c) => c.group === g.key && c.ok !== null);
    if (rows.length === 0) return "";
    return `
      <p style="margin:18px 0 8px;font-size:14px;font-weight:700;color:#0f172a;">${escapeHtml(g.label)}</p>
      <table style="width:100%;border-collapse:collapse;">
        ${rows
          .map(
            (c) => `
        <tr>
          <td style="width:28px;padding:8px 0;vertical-align:top;font-size:16px;">${c.ok ? "✅" : "❌"}</td>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#334155;">
            <strong style="color:#0f172a;">${escapeHtml(c.label)}</strong>
            <span style="color:#64748b;"> — ${escapeHtml(c.detail)}</span>
            ${c.ok ? "" : `<br><span style="color:#475569;font-size:13px;line-height:1.5;">${escapeHtml(c.fix)}</span>`}
          </td>
        </tr>`
          )
          .join("")}
      </table>`;
  }).join("");

  const vitalsHtml = result.vitals?.length
    ? `
      <h2 style="font-size:18px;color:#0f172a;margin:0 0 6px;padding-bottom:8px;border-bottom:2px solid #14b8a6;">⚡ Rychlost na mobilu (Google Lighthouse)</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:32px;">
        ${result.vitals
          .map(
            (v) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#334155;">${escapeHtml(v.label)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;font-weight:600;color:${v.good ? "#16a34a" : "#dc2626"};">${escapeHtml(v.value)}</td>
        </tr>`
          )
          .join("")}
      </table>`
    : "";

  const offer = offerFor(result);

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:16px 16px 0 0;padding:32px;text-align:center;">
      <!-- The site's own mark — teal tile with a white W, then the name — built
           from table cells: mail clients drop SVG and many block images. -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 12px;">
        <tr>
          <td width="36" height="36" align="center" valign="middle" style="width:36px;height:36px;background:#14b8a6;border-radius:9px;font-size:20px;line-height:36px;font-weight:800;color:#ffffff;">W</td>
          <td valign="middle" style="padding-left:10px;font-size:24px;line-height:36px;font-weight:700;letter-spacing:-0.02em;color:#ffffff;">Weblyx</td>
        </tr>
      </table>
      <p style="color:#94a3b8;font-size:14px;margin:0;">Bezplatný audit webu</p>
    </div>

    <!-- Content -->
    <div style="background:white;padding:32px;border-radius:0 0 16px 16px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

      ${introHtml}

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

      ${prioritiesHtml}

      <!-- Metrics -->
      <h2 style="font-size:18px;color:#0f172a;margin:0 0 16px;padding-bottom:8px;border-bottom:2px solid #14b8a6;">
        📊 Skóre podle kategorií
      </h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:32px;">
        ${metricsHtml}
      </table>

      ${vitalsHtml}

      <!-- Checklist -->
      ${
        checksHtml
          ? `
      <h2 style="font-size:18px;color:#0f172a;margin:0 0 4px;padding-bottom:8px;border-bottom:2px solid #14b8a6;">✔️ Kontrola bod po bodu</h2>
      <div style="margin-bottom:32px;">${checksHtml}</div>`
          : ""
      }

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

      <!-- Offer -->
      <div style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:12px;padding:24px;text-align:center;margin-top:24px;">
        <h3 style="color:#0f172a;font-size:18px;margin:0 0 8px;">${escapeHtml(offer.headline)}</h3>
        <p style="color:#334155;font-size:14px;line-height:1.6;margin:0 0 18px;">${escapeHtml(offer.body)}</p>
        <a href="https://www.weblyx.cz/poptavka?zdroj=audit&web=${encodeURIComponent(result.url)}" style="display:inline-block;padding:12px 28px;background:#14b8a6;color:white;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">
          ${escapeHtml(offer.cta)} →
        </a>
        <p style="color:#64748b;font-size:13px;margin:14px 0 0;">
          Nebo zavolejte: <a href="tel:+420702110166" style="color:#0d9488;font-weight:600;text-decoration:none;">702 110 166</a>
          · odpovězte na tento e-mail
        </p>
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
