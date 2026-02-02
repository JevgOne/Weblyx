"use client";

import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/app/admin/_components/AdminAuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Menu, Home, DollarSign, ArrowLeft, GitBranch, HelpCircle, Megaphone, Mail, BookOpen, BarChart3, Target, ArrowLeftRight, Trophy, Building2, Shield, Search } from "lucide-react";

export default function ContentManagementPage() {
  const router = useRouter();
  const { user } = useAdminAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin/dashboard")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Zpět
            </Button>
            <div>
              <h1 className="text-xl font-bold">Správa obsahu</h1>
              <p className="text-sm text-muted-foreground">CMS Editor</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Správa homepage</h2>
          <p className="text-muted-foreground">
            Upravte obsah jednotlivých sekcí vaší domovské stránky
          </p>
        </div>

        {/* Content Sections */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Pages & Texts - NEW UNIFIED EDITOR */}
          <Card className="hover:shadow-lg transition-shadow border-primary/50 bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Stránky & Texty</CardTitle>
                  <CardDescription>Univerzální editor</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Upravte všechny nadpisy a texty na webu z jednoho místa
              </p>
              <Button
                className="w-full"
                onClick={() => router.push("/admin/content/pages")}
              >
                Upravit stránky
              </Button>
            </CardContent>
          </Card>

          {/* Hero Section */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Home className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Hero sekce</CardTitle>
                  <CardDescription>Úvodní banner</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Upravte hlavní nadpis, podnadpis a CTA tlačítko
              </p>
              <Button
                className="w-full"
                onClick={() => router.push("/admin/content/hero")}
              >
                Upravit Hero
              </Button>
            </CardContent>
          </Card>

          {/* Services Section */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Menu className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Služby</CardTitle>
                  <CardDescription>6 servisních karet</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Spravujte karty služeb - přidávejte, upravujte nebo odstraňujte
              </p>
              <Button
                className="w-full"
                onClick={() => router.push("/admin/content/services")}
              >
                Spravovat Služby
              </Button>
            </CardContent>
          </Card>

          {/* Pricing Section */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Ceníky</CardTitle>
                  <CardDescription>Cenové úrovně</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Upravte cenové plány a jejich funkce
              </p>
              <Button
                className="w-full"
                onClick={() => router.push("/admin/content/pricing")}
              >
                Spravovat Ceníky
              </Button>
            </CardContent>
          </Card>

          {/* Process Section */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <GitBranch className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Proces</CardTitle>
                  <CardDescription>Jak to funguje</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Spravujte kroky pracovního procesu
              </p>
              <Button
                className="w-full"
                onClick={() => router.push("/admin/content/process")}
              >
                Spravovat Proces
              </Button>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <HelpCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>FAQ</CardTitle>
                  <CardDescription>Často kladené otázky</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Upravte otázky a odpovědi pro zákazníky
              </p>
              <Button
                className="w-full"
                onClick={() => router.push("/admin/content/faq")}
              >
                Spravovat FAQ
              </Button>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Megaphone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>CTA sekce</CardTitle>
                  <CardDescription>Call-to-Action banner</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Upravte výzvu k akci na konci homepage
              </p>
              <Button
                className="w-full"
                onClick={() => router.push("/admin/content/cta")}
              >
                Upravit CTA
              </Button>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Kontakt</CardTitle>
                  <CardDescription>Kontaktní informace</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Upravte kontaktní údaje a formulář
              </p>
              <Button
                className="w-full"
                onClick={() => router.push("/admin/content/contact")}
              >
                Upravit Kontakt
              </Button>
            </CardContent>
          </Card>

          {/* Social Proof Stats */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Social Proof</CardTitle>
                  <CardDescription>Statistiky a čísla</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Upravte statistiky (projekty, hodnocení, rychlost)
              </p>
              <Button className="w-full" onClick={() => router.push("/admin/content/social-proof")}>
                Upravit Social Proof
              </Button>
            </CardContent>
          </Card>

          {/* Target Audience */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Cílová skupina</CardTitle>
                  <CardDescription>Pro koho tvoříme</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Upravte karty cílových skupin (živnostníci, firmy, e-shopy)
              </p>
              <Button className="w-full" onClick={() => router.push("/admin/content/target-audience")}>
                Upravit Cílovou skupinu
              </Button>
            </CardContent>
          </Card>

          {/* Before/After */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ArrowLeftRight className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Before / After</CardTitle>
                  <CardDescription>Porovnání webů</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Upravte porovnávací tabulku a metriky
              </p>
              <Button className="w-full" onClick={() => router.push("/admin/content/before-after")}>
                Upravit Before/After
              </Button>
            </CardContent>
          </Card>

          {/* Case Study */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Case Study</CardTitle>
                  <CardDescription>Texty case study</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Upravte nadpisy sekce (data z portfolia)
              </p>
              <Button className="w-full" onClick={() => router.push("/admin/content/case-study")}>
                Upravit Case Study
              </Button>
            </CardContent>
          </Card>

          {/* Client Logos */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Klientská loga</CardTitle>
                  <CardDescription>Seznam klientů</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Spravujte seznam klientů zobrazených na homepage
              </p>
              <Button className="w-full" onClick={() => router.push("/admin/content/client-logos")}>
                Upravit Klienty
              </Button>
            </CardContent>
          </Card>

          {/* Trust Badges */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Trust Badges</CardTitle>
                  <CardDescription>Odznaky důvěry</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Upravte odznaky důvěry (SSL, garance, termín)
              </p>
              <Button className="w-full" onClick={() => router.push("/admin/content/trust-badges")}>
                Upravit Trust Badges
              </Button>
            </CardContent>
          </Card>

          {/* Free Audit */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Free Audit</CardTitle>
                  <CardDescription>Bezplatný audit</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Upravte texty formuláře bezplatného auditu
              </p>
              <Button className="w-full" onClick={() => router.push("/admin/content/free-audit")}>
                Upravit Free Audit
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Help Section */}
        <Card className="mt-8 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Nápověda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p className="font-semibold text-primary pb-2">
              Doporučeno: Použijte nový Univerzální editor stránek
            </p>
            <p>
              <strong>Stránky & Texty:</strong> Nový univerzální editor pro všechny nadpisy a texty na webu - jednodušší a rychlejší
            </p>
            <hr className="my-3 border-primary/20" />
            <p className="text-xs italic">Jednotlivé editory sekcí (níže) budou postupně odstraněny:</p>
            <p>
              <strong>Hero sekce:</strong> Upravte hlavní úvodní sekci s nadpisem a call-to-action tlačítkem
            </p>
            <p>
              <strong>Služby:</strong> Přidávejte nebo upravujte až 6 servisních karet s ikonami a funkcemi
            </p>
            <p>
              <strong>Ceníky:</strong> Spravujte cenové úrovně, ceny a funkce jednotlivých plánů
            </p>
            <p>
              <strong>Proces:</strong> Definujte kroky vašeho pracovního procesu od konzultace po podporu
            </p>
            <p>
              <strong>FAQ:</strong> Přidávejte často kladené otázky a odpovědi pro vaše zákazníky
            </p>
            <p>
              <strong>CTA sekce:</strong> Upravte Call-to-Action banner s výhodami a tlačítky
            </p>
            <p>
              <strong>Kontakt:</strong> Spravujte kontaktní informace, formulář a otevírací dobu
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
