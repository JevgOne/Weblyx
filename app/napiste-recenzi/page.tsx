import type { Metadata } from "next";
import { ReviewSubmissionForm } from "@/components/reviews/ReviewSubmissionForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Napište nám recenzi | Weblyx",
  description: "Sdílejte svou zkušenost s našimi službami. Vaše zpětná vazba nám pomáhá se zlepšovat a pomáhá ostatním při výběru našich služeb.",
  robots: "noindex, nofollow", // Don't index review submission page
};

export default function ReviewSubmissionPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <section className="py-12 px-4 border-b">
        <div className="container mx-auto max-w-4xl">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="mb-6"
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zpět na hlavní stránku
            </Link>
          </Button>

          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 text-primary">
              <Star className="h-8 w-8 fill-primary" />
              <Star className="h-8 w-8 fill-primary" />
              <Star className="h-8 w-8 fill-primary" />
              <Star className="h-8 w-8 fill-primary" />
              <Star className="h-8 w-8 fill-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">
              Napište nám recenzi
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Vaše zpětná vazba je pro nás důležitá. Pomozte ostatním zjistit, jaké to je pracovat s námi.
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <ReviewSubmissionForm />
        </div>
      </section>

      {/* Info Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold">Jak to funguje?</h2>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <span>Vyplňte formulář s vaší zkušeností a hodnocením</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <span>Vaše recenze bude odeslána k naší kontrole</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <span>Po schválení bude vaše recenze zobrazena na našem webu</span>
              </li>
            </ol>

            <div className="pt-4 border-t text-xs text-muted-foreground">
              <p>
                <strong>Ochrana osobních údajů:</strong> Zveřejněno bude pouze vaše jméno a pozice (pokud ji uvedete).
                Váš email nebude nikdy zveřejněn ani sdílen s třetími stranami.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
