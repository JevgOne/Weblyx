"use client";

import { useMemo, useState } from "react";
import {
  addonCountLabel,
  addonsForTier,
  buildConfiguration,
  formatCzk,
  supportMonthsLabel,
  type PricingData,
} from "@/lib/pricing/types";
import { DEFAULT_TIER_ID } from "@/lib/nova/pricing";

export function NovaPriceConfigurator({ pricing }: { pricing: PricingData }) {
  const { tiers } = pricing;

  const [tierId, setTierId] = useState(
    () => (tiers.find((t) => t.id === DEFAULT_TIER_ID) ?? tiers[0])?.id ?? ""
  );
  const [addonIds, setAddonIds] = useState<string[]>([]);

  const config = useMemo(
    () => buildConfiguration(pricing, tierId, addonIds),
    [pricing, tierId, addonIds]
  );

  /**
   * Blog ships inside Základní web, booking inside Standardní web. Offering
   * them again as paid extras on those tiers contradicted the package the
   * visitor had just read, at the exact moment they were deciding.
   *
   * Ticks for hidden add-ons stay in state on purpose, so switching tiers back
   * and forth does not silently lose a selection; `buildConfiguration` drops
   * them from the price either way.
   */
  const offeredAddons = useMemo(() => addonsForTier(pricing, tierId), [pricing, tierId]);

  const toggleAddon = (id: string) =>
    setAddonIds((current) =>
      current.includes(id) ? current.filter((a) => a !== id) : [...current, id]
    );

  /**
   * The lead needs to carry the configuration, not just "someone clicked CTA".
   * Only IDs travel — the server recomputes price and hours from them, so a
   * hand-edited URL cannot dictate a price.
   */
  const enquiryHref = useMemo(() => {
    if (!config) return "/poptavka";

    const params = new URLSearchParams({ balicek: config.tierId });
    if (config.addons.length) {
      params.set("doplnky", config.addons.map((a) => a.id).join(","));
    }
    return `/poptavka?${params.toString()}`;
  }, [config]);

  if (!config) return null;

  return (
    <section
      id="cenik"
      className="scroll-mt-20 border-t"
      style={{ background: "var(--n-bg-alt)", borderColor: "rgba(15,23,42,.07)" }}
    >
      <div className="nova-container nova-section">
        <div className="mb-16 text-center">
          <h2 className="nova-h2">Ceník</h2>
          <p className="nova-lead">
            Poskládejte si web a hned víte cenu. Jednorázově, bez měsíčních poplatků.
          </p>
          <p
            className="mx-auto mt-[18px] max-w-[640px] text-[15px] font-medium"
            style={{ lineHeight: 1.6, color: "var(--n-text-muted)" }}
          >
            Pevná cena za předem daný rozsah — ne otevřený účet za hodiny. U každého
            balíčku vidíte, kolik práce za ním stojí, kdy ho dostanete a jak dlouho
            se o web staráme po spuštění.
          </p>
        </div>

        <div
          className="nova-conf mx-auto grid max-w-[1060px] items-start gap-8"
          style={{ gridTemplateColumns: "1fr 380px" }}
        >
          {/* --- Choices ------------------------------------------------- */}
          <div
            className="rounded-[22px] border p-9"
            style={{ background: "var(--n-bg)", borderColor: "var(--n-border)" }}
          >
            <h3 className="nova-label" id="nova-tier-label">
              1 — Typ webu
            </h3>
            <div
              className="nova-col3 mt-[18px] grid grid-cols-3 gap-3"
              role="group"
              aria-labelledby="nova-tier-label"
            >
              {tiers.map((option) => {
                const active = config.tierId === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setTierId(option.id)}
                    aria-pressed={active}
                    className="rounded-[14px] px-6 py-[22px] text-left transition-all duration-200"
                    style={{
                      border: `1.5px solid ${active ? "var(--n-brand)" : "rgba(15,23,42,.12)"}`,
                      background: active ? "var(--n-brand)" : "var(--n-bg)",
                      color: active ? "#ffffff" : "var(--n-ink)",
                    }}
                  >
                    <span
                      className="block text-base font-bold"
                      style={{ letterSpacing: "-.02em" }}
                    >
                      {option.name}
                    </span>
                    <span
                      className="mt-[5px] block text-[13px] font-medium"
                      style={{ color: active ? "rgba(255,255,255,.85)" : "var(--n-text-muted)" }}
                    >
                      {option.shortDesc}
                    </span>
                    <span
                      className="mt-[5px] block text-[13px] font-medium"
                      style={{ color: active ? "rgba(255,255,255,.85)" : "var(--n-text-muted)" }}
                    >
                      {option.hours} h práce
                    </span>
                    <span
                      className="mt-3.5 block whitespace-nowrap text-xl font-extrabold"
                      style={{
                        letterSpacing: "-.03em",
                        color: active ? "#ffffff" : "var(--n-brand-dark)",
                      }}
                    >
                      {formatCzk(option.price)} Kč
                    </span>
                  </button>
                );
              })}
            </div>

            <h3 className="nova-label mt-9">2 — Doplňky</h3>
            <div className="mt-[18px] flex flex-col gap-2.5">
              {offeredAddons.map((addon) => {
                const active = addonIds.includes(addon.id);
                return (
                  <label
                    key={addon.id}
                    className="flex cursor-pointer items-center gap-3.5 rounded-xl px-[18px] py-[15px] transition-all duration-200"
                    style={{
                      border: `1.5px solid ${active ? "var(--n-brand-dark)" : "var(--n-border)"}`,
                      background: active ? "rgba(20,184,166,.07)" : "var(--n-bg)",
                    }}
                  >
                    {/* Real checkbox kept in the DOM for keyboard and screen
                        readers; the square below is its visual stand-in. */}
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleAddon(addon.id)}
                      className="sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className="flex h-5 w-5 shrink-0 items-center justify-center text-xs font-extrabold text-white"
                      style={{
                        borderRadius: 6,
                        background: active ? "var(--n-brand-dark)" : "transparent",
                        border: `1.5px solid ${active ? "var(--n-brand-dark)" : "rgba(15,23,42,.22)"}`,
                      }}
                    >
                      {active ? "✓" : ""}
                    </span>
                    <span className="text-[15px] font-semibold">{addon.name}</span>
                    <span className="text-[13px] font-medium" style={{ color: "var(--n-text-dim)" }}>
                      {addon.hours} h
                    </span>
                    <span
                      className="ml-auto whitespace-nowrap text-sm font-semibold"
                      style={{ color: active ? "var(--n-brand-dark)" : "var(--n-text-muted)" }}
                    >
                      + {formatCzk(addon.price)} Kč
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* --- Summary -------------------------------------------------- */}
          <div
            className="nova-conf-sticky sticky rounded-[22px] p-9"
            style={{ background: "var(--n-ink)", color: "#ffffff", top: 96 }}
          >
            <h3 className="nova-label" style={{ color: "var(--n-text-dim)" }}>
              Vaše konfigurace
            </h3>

            {/* aria-live so keyboard and screen-reader users hear the total change */}
            <p className="nova-price mt-5" aria-live="polite">
              {formatCzk(config.totalPrice)} Kč
            </p>
            <p className="mt-2.5 text-sm font-medium" style={{ color: "var(--n-text-dim)" }}>
              jednorázově · {addonCountLabel(config.addons.length)}
            </p>

            <dl>
              <div
                className="mt-7 flex items-baseline justify-between border-t pt-5"
                style={{ borderColor: "var(--n-border-dark)" }}
              >
                <dt className="text-[15px]" style={{ color: "var(--n-text-dim)" }}>
                  Odhad práce
                </dt>
                <dd className="text-[19px] font-bold">{config.totalHours} h</dd>
              </div>
              <div className="mt-3.5 flex items-baseline justify-between">
                <dt className="text-[15px]" style={{ color: "var(--n-text-dim)" }}>
                  Dodání
                </dt>
                <dd className="text-[19px] font-bold">{config.deliveryDays} dní</dd>
              </div>
              <div className="mt-3.5 flex items-baseline justify-between">
                <dt className="text-[15px]" style={{ color: "var(--n-text-dim)" }}>
                  Podpora po spuštění
                </dt>
                <dd className="text-[19px] font-bold">
                  {supportMonthsLabel(config.supportMonths)}
                </dd>
              </div>
              <div className="mt-3.5 flex items-baseline justify-between">
                <dt className="text-[15px]" style={{ color: "var(--n-text-dim)" }}>
                  Měsíční poplatky
                </dt>
                <dd className="text-[19px] font-bold" style={{ color: "var(--n-brand-light)" }}>
                  0 Kč
                </dd>
              </div>
            </dl>

            <a
              href={enquiryHref}
              className="mt-[30px] block rounded-full py-4 text-center text-base font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: "var(--n-brand)" }}
            >
              Poslat tuto poptávku
            </a>
            <p
              className="mt-4 text-center text-[13px] font-medium"
              style={{ color: "var(--n-text-dim)" }}
            >
              Platba až po předání · neomezené revize
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
