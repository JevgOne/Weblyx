"use client";

import { useEffect, useRef, useState } from "react";

interface BarProps {
  label: string;
  value: string;
  /** Final width as a percentage of the track. */
  width: number;
  fill: string;
  labelColor: string;
  valueColor: string;
  grown: boolean;
}

function Bar({ label, value, width, fill, labelColor, valueColor, grown }: BarProps) {
  return (
    <div>
      <div className="mb-3.5 flex items-baseline justify-between gap-4">
        <span className="text-[15px] font-semibold" style={{ color: labelColor }}>
          {label}
        </span>
        <span
          className="text-[34px] font-extrabold"
          style={{ letterSpacing: "-.04em", color: valueColor }}
        >
          {value}
        </span>
      </div>
      <div
        className="h-2.5 overflow-hidden rounded-full"
        style={{ background: "rgba(255,255,255,.1)" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: grown ? `${width}%` : "0%",
            background: fill,
            transition: "width 1.1s cubic-bezier(.2,.7,.2,1)",
          }}
        />
      </div>
    </div>
  );
}

export function NovaSpeedPledge() {
  const ref = useRef<HTMLDivElement>(null);
  const [grown, setGrown] = useState(false);

  useEffect(() => {
    // Reduced motion: show the final widths immediately, skip the growth.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setGrown(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setGrown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section style={{ background: "var(--n-ink)", color: "#ffffff" }}>
      <div
        className="nova-container nova-col2 nova-section-dark grid items-center gap-20"
        style={{ gridTemplateColumns: "1fr 1fr" }}
      >
        <div>
          <p className="mb-5 text-sm font-semibold" style={{ color: "var(--n-brand-light)" }}>
            Rychlost
          </p>
          <h2 className="nova-h2-dark">Načítání pod 2 vteřiny. Garantujeme.</h2>
          <p
            className="mt-6 max-w-[460px] text-[18px] font-medium"
            style={{ lineHeight: 1.6, color: "var(--n-text-dim)" }}
          >
            53 % lidí opustí web, který se načítá déle než 3 sekundy. Náš se načte pod 2 — nebo vám
            vrátíme peníze.
          </p>
        </div>

        <div ref={ref} className="flex flex-col gap-[38px]">
          <Bar
            label="Běžný web"
            value="4–8 s"
            width={100}
            fill="#475569"
            labelColor="var(--n-text-dim)"
            valueColor="var(--n-text-dim)"
            grown={grown}
          />
          <Bar
            label="Web od Weblyx"
            value="pod 2 s"
            width={16}
            fill="var(--n-brand)"
            labelColor="var(--n-brand-light)"
            valueColor="#ffffff"
            grown={grown}
          />
          <p
            className="border-t pt-2 text-sm font-medium"
            style={{ color: "var(--n-text-dim)", borderColor: "rgba(255,255,255,.12)" }}
          >
            PageSpeed 40–60 vs. 90–100 · reálné hodnoty z projektu Titan Gym
          </p>
        </div>
      </div>
    </section>
  );
}
