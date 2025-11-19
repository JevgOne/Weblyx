import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nezávazná poptávka | Weblyx",
  description: "Vyplňte nezávaznou poptávku a my vám do 24 hodin pošleme konkrétní nabídku na míru.",
};

export default function QuotePage() {
  return (
    <main className="min-h-screen">
      <section className="py-20 md:py-32 px-4">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <h1 className="text-4xl md:text-5xl font-bold">
            Nezávazná <span className="text-primary">poptávka</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Dotazník bude dostupný brzy. Zatím nás můžete kontaktovat přímo na{" "}
            <a href="mailto:info@weblyx.cz" className="text-primary hover:underline">
              info@weblyx.cz
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
