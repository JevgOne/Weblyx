import { getLocale } from "next-intl/server";

// Client logos — add real logos when available
const clients = [
  { name: "Titan Gym", slug: "titan-gym" },
  { name: "MŮZA Hair", slug: "muza-hair" },
  { name: "CarMakléř", slug: "car-makler" },
  { name: "FitCoach", slug: "fitcoach" },
  { name: "ProdavameSRO", slug: "prodavame-sro" },
  { name: "VykupujemeSRO", slug: "vykupujeme-sro" },
];

export async function ClientLogos() {
  const locale = await getLocale();
  const isDE = locale === "de";

  return (
    <section className="py-12 px-4 border-t border-border/40">
      <div className="container mx-auto max-w-5xl">
        <p className="text-center text-sm text-muted-foreground mb-8 uppercase tracking-wider font-medium">
          {isDE ? "Vertrauen uns" : "Důvěřují nám"}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {clients.map((client) => (
            <div
              key={client.slug}
              className="text-lg md:text-xl font-semibold text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
              title={client.name}
            >
              {client.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
