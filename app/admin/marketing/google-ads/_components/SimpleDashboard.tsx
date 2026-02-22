"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Target, TrendingDown } from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  status: string;
  impressions: number;
  clicks: number;
  ctr: number;
  cost: number;
  conversions: number;
  costPerConversion: number | null;
}

interface SimpleDashboardProps {
  campaigns: Campaign[];
}

type SemaphoreColor = "green" | "yellow" | "red";

function getSemaphore(campaigns: Campaign[]): { color: SemaphoreColor; label: string; description: string } {
  const totals = campaigns.reduce(
    (acc, c) => ({
      cost: acc.cost + c.cost,
      conversions: acc.conversions + c.conversions,
      clicks: acc.clicks + c.clicks,
      impressions: acc.impressions + c.impressions,
    }),
    { cost: 0, conversions: 0, clicks: 0, impressions: 0 }
  );

  // No data yet
  if (totals.impressions === 0) {
    return { color: "yellow", label: "Čeká na data", description: "Kampaň běží krátce, zatím nemáme dostatek dat." };
  }

  const ctr = totals.impressions > 0 ? totals.clicks / totals.impressions : 0;
  const cpa = totals.conversions > 0 ? totals.cost / totals.conversions : Infinity;

  // Green: CTR > 2% and has conversions with reasonable CPA
  if (ctr > 0.02 && totals.conversions > 0 && cpa < 1000) {
    return { color: "green", label: "Funguje dobře", description: "Kampaň generuje konverze za rozumnou cenu." };
  }

  // Red: CTR < 1% or CPA > 2000 with significant spend
  if ((ctr < 0.01 && totals.impressions > 500) || (cpa > 2000 && totals.cost > 2000)) {
    return { color: "red", label: "Potřebuje zásah", description: "Kampaň nefunguje optimálně. Podívejte se na doporučení." };
  }

  // Yellow: everything else
  return { color: "yellow", label: "Potřeba optimalizovat", description: "Kampaň funguje, ale je prostor pro zlepšení." };
}

const semaphoreStyles: Record<SemaphoreColor, { bg: string; dot: string; text: string }> = {
  green: { bg: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800", dot: "bg-green-500", text: "text-green-700 dark:text-green-400" },
  yellow: { bg: "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800", dot: "bg-yellow-500", text: "text-yellow-700 dark:text-yellow-400" },
  red: { bg: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800", dot: "bg-red-500", text: "text-red-700 dark:text-red-400" },
};

export default function SimpleDashboard({ campaigns }: SimpleDashboardProps) {
  const totals = campaigns.reduce(
    (acc, c) => ({
      cost: acc.cost + c.cost,
      conversions: acc.conversions + c.conversions,
      clicks: acc.clicks + c.clicks,
      impressions: acc.impressions + c.impressions,
    }),
    { cost: 0, conversions: 0, clicks: 0, impressions: 0 }
  );

  const cpa = totals.conversions > 0 ? totals.cost / totals.conversions : 0;
  const semaphore = getSemaphore(campaigns);
  const style = semaphoreStyles[semaphore.color];

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("cs-CZ", { style: "currency", currency: "CZK", maximumFractionDigits: 0 }).format(value);

  return (
    <div className="space-y-4">
      {/* Semaphore */}
      <div className={`p-4 rounded-lg border ${style.bg} flex items-center gap-3`}>
        <div className={`w-4 h-4 rounded-full ${style.dot} shrink-0`} />
        <div>
          <p className={`font-semibold ${style.text}`}>{semaphore.label}</p>
          <p className="text-sm text-muted-foreground">{semaphore.description}</p>
        </div>
      </div>

      {/* 3 big metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Utraceno (30 dní)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(totals.cost)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {totals.clicks > 0 ? `CPC: ${formatCurrency(totals.cost / totals.clicks)}` : "Zatím bez kliků"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Konverze / Poptávky
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-teal-600">{totals.conversions}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {totals.clicks > 0
                ? `z ${totals.clicks} kliků (${((totals.conversions / totals.clicks) * 100).toFixed(1)}%)`
                : "Zatím bez dat"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Cena za konverzi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${cpa > 1000 ? "text-red-500" : cpa > 0 ? "text-teal-600" : ""}`}>
              {cpa > 0 ? formatCurrency(cpa) : "-"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {cpa > 0 ? "Kolik stojí jeden lead" : "Zatím žádná konverze"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
