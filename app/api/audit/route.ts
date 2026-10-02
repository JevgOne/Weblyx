import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/resend-client";
import { recordAudit } from "@/lib/audits/server";
import {
  BENCHMARK_AVERAGE,
  BENCHMARK_SAMPLE,
  BENCHMARK_URL,
  benchmarkVerdict,
  buildEmailHtml,
  runAudit,
} from "@/lib/audits/report";

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
