import type { Metadata } from "next";
import { Portfolio } from "@/components/home/portfolio";

export const metadata: Metadata = {
  title: "Portfolio | Weblyx - Naše projekty",
  description: "Podívejte se na naše realizované projekty a ukázky naší práce. Webové stránky, e-shopy a další řešení.",
};

export default function PortfolioPage() {
  return (
    <main className="min-h-screen">
      <section className="py-20 md:py-32 px-4 gradient-hero grid-pattern">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
            Naše <span className="text-primary">projekty</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Podívejte se na ukázky naší práce a realizovaných projektů
          </p>
        </div>
      </section>
      <div className="py-16">
        <Portfolio />
      </div>
    </main>
  );
}
