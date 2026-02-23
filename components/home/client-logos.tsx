import { getLocale } from "next-intl/server";
import { getHomepagePortfolio } from "@/lib/turso/portfolio";
import Image from "next/image";

export async function ClientLogos() {
  const locale = await getLocale();
  const isDE = locale === "de";

  // Load portfolio items marked for homepage
  let clients: { name: string; logoUrl?: string }[] = [];
  try {
    const items = await getHomepagePortfolio(locale);
    clients = items.map((item) => ({
      name: item.title,
      logoUrl: item.clientLogoUrl,
    }));
  } catch {}

  // Don't render if no clients selected for homepage
  if (clients.length === 0) return null;

  const heading = isDE ? "Vertrauen uns" : "Důvěřují nám";

  return (
    <section className="py-12 px-4 border-t border-border/40">
      <div className="container mx-auto max-w-5xl">
        <p className="text-center text-sm text-muted-foreground mb-8 uppercase tracking-wider font-medium">
          {heading}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {clients.map((client, i) => (
            <div
              key={i}
              className="flex items-center justify-center"
              title={client.name}
            >
              {client.logoUrl ? (
                <Image
                  src={client.logoUrl}
                  alt={client.name}
                  width={120}
                  height={48}
                  className="h-10 md:h-12 w-auto object-contain opacity-50 hover:opacity-80 transition-opacity grayscale hover:grayscale-0"
                />
              ) : (
                <span className="text-lg md:text-xl font-semibold text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors">
                  {client.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
