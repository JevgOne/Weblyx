import Link from "next/link";
import { getAllFAQItems } from "@/lib/turso/cms";
import { safeRead } from "@/lib/safe-read";

/**
 * The FAQ, back on the homepage.
 *
 * With a static fallback, because `safeRead` swallows a database error and
 * returns an empty list — and an empty list used to return null, deleting the
 * section and the FAQPage schema with it. Nothing logged, nothing visible.
 * Googlebot was seeing a homepage that differed by three hundred words and a
 * whole schema block between crawls depending on whether one Turso query got
 * through, which reads as an unstable page rather than a broken one.
 *
 * The redesign dropped it, which cost the page about 300 words of the copy
 * that actually answers what a visitor searches for — price, delivery time,
 * support — and took the FAQPage schema with it. The answers come from the
 * same rows /faq renders, so the two can never drift apart.
 */
/** Mirrors the rows in `faq_items`; used only when the database is unreachable. */
const FALLBACK = [
  {
    question: "Kolik stojí webové stránky?",
    answer:
      "Landing page stojí 7 990 Kč, základní web s 3–5 podstránkami a blogem 14 900 Kč a standardní web s 10+ podstránkami 29 900 Kč — vždy jednorázově, bez měsíčních poplatků za web.",
  },
  {
    question: "Jak dlouho trvá vytvoření webu?",
    answer:
      "Landing page dodáme za 3–5 pracovních dní, základní web za 5–7 dní a standardní web za 7–10 dní. Po úvodní konzultaci dostanete přesný termín.",
  },
  {
    question: "Jak probíhá platba?",
    answer:
      "Standardně vyžadujeme zálohu 50 % před zahájením prací a doplatek před předáním hotového webu. Platit můžete fakturou s QR kódem nebo bankovním převodem.",
  },
  {
    question: "Nabízíte následnou podporu?",
    answer:
      "Podpora po spuštění je v ceně každého balíčku: 1 měsíc u landing page, 2 měsíce u základního webu a 3 měsíce u standardního. Poté si můžete pořídit roční údržbu za 24 000 Kč.",
  },
];

export async function NovaFaq() {
  const items = await safeRead(() => getAllFAQItems("cs"), [], "nova faq");
  const fromDb = items.filter((item) => item.enabled !== false).slice(0, 8);

  // The section never disappears; at worst it shrinks to what is written here.
  const shown = fromDb.length > 0 ? fromDb : FALLBACK;

  return (
    <section id="faq" className="scroll-mt-20 nova-container nova-section">
      <div className="mb-14 text-center">
        <h2 className="nova-h2">Časté otázky</h2>
        <p className="nova-lead">Na co se nás klienti ptají nejčastěji.</p>
      </div>

      <div className="mx-auto max-w-[820px]">
        {shown.map((item, index) => (
          <details
            key={item.question}
            className="group border-t py-6"
            style={{ borderColor: "var(--n-border-soft)" }}
          >
            <summary className="flex cursor-pointer list-none items-start justify-between gap-6">
              <h3 className="text-[19px] font-bold" style={{ letterSpacing: "-.02em" }}>
                {item.question}
              </h3>
              <span
                aria-hidden="true"
                className="mt-1 shrink-0 text-[22px] font-medium leading-none transition-transform group-open:rotate-45"
                style={{ color: "var(--n-brand-dark)" }}
              >
                +
              </span>
            </summary>
            <p
              className="mt-3.5 max-w-[700px] text-[16px] font-medium"
              style={{ lineHeight: 1.65, color: "var(--n-text-muted)" }}
            >
              {item.answer}
            </p>
          </details>
        ))}
      </div>

      <p className="mt-10 text-center text-[15px] font-medium" style={{ color: "var(--n-text-muted)" }}>
        Nenašli jste odpověď?{" "}
        <Link href="/faq" className="font-semibold" style={{ color: "var(--n-brand-dark)" }}>
          Všechny otázky
        </Link>{" "}
        nebo nám{" "}
        <Link href="#kontakt" className="font-semibold" style={{ color: "var(--n-brand-dark)" }}>
          napište
        </Link>
        .
      </p>
    </section>
  );
}
