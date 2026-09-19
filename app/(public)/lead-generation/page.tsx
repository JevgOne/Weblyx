import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import {
  Bot,
  Mail,
  BarChart3,
  Target,
  Zap,
  CheckCircle,
  ArrowRight,
  Globe,
  TrendingUp,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "AI Lead Generation | Generování leadů s AI",
  description: "🤖 Automatický AI systém pro generování leadů. Scraping z Google Maps, analýza webů, AI personalizované emaily. Získejte stovky kvalitních leadů za pár minut!",
  keywords: [
    "lead generation",
    "AI lead generation",
    "automatické leadování",
    "google maps scraping",
    "AI emailing",
    "business leads",
    "B2B leadování",
    "automatizace leadů",
  ],
};

export default function LeadGenerationPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full mb-6 font-medium">
              <Bot className="h-4 w-4" />
              AI-Powered Lead Generation
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Získejte stovky leadů automaticky s AI
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Náš AI systém najde, analyzuje a kontaktuje potenciální zákazníky za vás.
              <br />
              <span className="font-semibold text-teal-600">Ušetřete 10+ hodin týdně</span> manuální práce.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white" asChild>
                <Link href="/poptavka">
                  <Target className="h-5 w-5 mr-2" />
                  Začít zdarma
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#jak-to-funguje">
                  Jak to funguje
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div>
                <div className="text-3xl font-bold text-teal-600">10x</div>
                <div className="text-sm text-gray-600">Rychlejší než manuálně</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-cyan-600">500+</div>
                <div className="text-sm text-gray-600">Leadů za hodinu</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">AI</div>
                <div className="text-sm text-gray-600">Personalizace</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="jak-to-funguje" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Jak to funguje?</h2>
            <p className="text-xl text-gray-600">
              3 jednoduché kroky k automatickému lead generation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="relative">
              <div className="absolute -top-4 left-6 w-12 h-12 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <CardHeader className="pt-8">
                <Bot className="h-12 w-12 text-teal-600 mb-4" />
                <CardTitle>AI Scraping</CardTitle>
                <CardDescription>
                  Zadejte dotaz (např. "pekárna Praha") a náš AI bot automaticky prohledá Google Maps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-teal-600 mt-0.5" />
                    <span>Najde stovky firem</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-teal-600 mt-0.5" />
                    <span>Extrahuje kontakty</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-teal-600 mt-0.5" />
                    <span>Ověří emaily</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="relative">
              <div className="absolute -top-4 left-6 w-12 h-12 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <CardHeader className="pt-8">
                <Globe className="h-12 w-12 text-cyan-600 mb-4" />
                <CardTitle>Analýza Webů</CardTitle>
                <CardDescription>
                  AI analyzuje jejich weby a najde příležitosti pro zlepšení
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-cyan-600 mt-0.5" />
                    <span>SEO audit</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-cyan-600 mt-0.5" />
                    <span>Performance check</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-cyan-600 mt-0.5" />
                    <span>Design analýza</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="relative">
              <div className="absolute -top-4 left-6 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <CardHeader className="pt-8">
                <Mail className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>AI Emaily</CardTitle>
                <CardDescription>
                  Vygeneruje personalizované emaily s konkrétními návrhy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <span>100% personalizace</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <span>Click tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <span>Conversion měření</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Proč náš AI systém?</h2>
            <p className="text-xl text-gray-600">
              Automatizujte celý lead generation proces
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-yellow-600 mb-2" />
                <CardTitle className="text-lg">Bleskově rychlé</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Získejte 500+ leadů za hodinu. To, co vám ručně zabralo týden, máme za 1 hodinu.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Target className="h-10 w-10 text-teal-600 mb-2" />
                <CardTitle className="text-lg">Přesné cílení</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Targetujte firmy podle lokace, odvětví, velikosti. AI najde přesně ty pravé.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Mail className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle className="text-lg">AI Personalizace</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Každý email je jedinečný. AI analyzuje web a vytvoří konkrétní návrh.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-purple-600 mb-2" />
                <CardTitle className="text-lg">Měření výsledků</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Sledujte open rate, click rate, konverze. Vše v reálném čase.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-green-600 mb-2" />
                <CardTitle className="text-lg">Vyšší konverze</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Personalizované emaily mají 3-5x vyšší response rate než generické.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-orange-600 mb-2" />
                <CardTitle className="text-lg">Neomezené leadování</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Bez limitů. Generujte tisíce leadů měsíčně bez extra poplatků.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Jednoduché ceny</h2>
            <p className="text-xl text-gray-600">
              Bez skrytých poplatků. Platíte jen za výsledky.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Starter</CardTitle>
                <CardDescription>Pro začátečníky</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">Zdarma</span>
                  <span className="text-gray-600">/měsíc</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-teal-600 mt-0.5" />
                    <span>50 leadů/měsíc</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-teal-600 mt-0.5" />
                    <span>AI analýza webů</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-teal-600 mt-0.5" />
                    <span>Email templates</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/poptavka">Začít zdarma</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-teal-600 border-2 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-teal-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                Nejpopulárnější
              </div>
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <CardDescription>Pro rozvíjející se firmy</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">2 990 Kč</span>
                  <span className="text-gray-600">/měsíc</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-teal-600 mt-0.5" />
                    <span>500 leadů/měsíc</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-teal-600 mt-0.5" />
                    <span>AI personalizované emaily</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-teal-600 mt-0.5" />
                    <span>Advanced tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-teal-600 mt-0.5" />
                    <span>Priority podpora</span>
                  </li>
                </ul>
                <Button className="w-full bg-teal-600 hover:bg-teal-700" asChild>
                  <Link href="/poptavka">Vybrat Pro</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>Pro velké firmy</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">Custom</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-teal-600 mt-0.5" />
                    <span>Neomezené leady</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-teal-600 mt-0.5" />
                    <span>Vlastní AI model</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-teal-600 mt-0.5" />
                    <span>Dedicated manager</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-teal-600 mt-0.5" />
                    <span>API přístup</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/kontakt">Kontaktujte nás</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Připraveni automatizovat lead generation?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Začněte zdarma ještě dnes a získejte první leady za pár minut.
          </p>
          <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-100" asChild>
            <Link href="/poptavka">
              Začít zdarma
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
