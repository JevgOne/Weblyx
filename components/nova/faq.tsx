import Link from "next/link";
import { getAllFAQItems } from "@/lib/turso/cms";
import { safeRead } from "@/lib/safe-read";

/**
 * The FAQ, back on the homepage.
 *
 * The redesign dropped it, which cost the page about 300 words of the copy
 * that actually answers what a visitor searches for — price, delivery time,
 * support — and took the FAQPage schema with it. The answers come from the
 * same rows /faq renders, so the two can never drift apart.
 */
export async function NovaFaq() {
  const items = await safeRead(() => getAllFAQItems("cs"), [], "nova faq");
  const shown = items.filter((item) => item.enabled !== false).slice(0, 8);

  if (shown.length === 0) return null;

  return (
    <section id="faq" className="scroll-mt-20 nova-container nova-section">
      <div className="mb-14 text-center">
        <h2 className="nova-h2">Časté otázky</h2>
        <p className="nova-lead">Na co se nás klienti ptají nejčastěji.</p>
      </div>

      <div className="mx-auto max-w-[820px]">
        {shown.map((item, index) => (
          <details
            key={item.id ?? index}
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
