import type { Metadata } from "next";
import { getAlternateLanguages } from "@/lib/seo-metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { LeadButton } from "@/components/tracking/LeadButton";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Scale,
  Shield,
  Users,
  CalendarCheck,
  FileText,
  Search,
  Smartphone,
  Zap,
  Check,
  Lock,
  BookOpen,
  MessageSquare,
} from "lucide-react";
import { generateWebPageSchema, BreadcrumbItem } from "@/lib/schema-org";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Web pro právníky | Webové stránky pro advokáty od 9 990 Kč | Weblyx",
  description:
    "⚡ Profesionální web pro právníky a advokátní kanceláře od 9 990 Kč. Klientský portál, online objednávky konzultací, GDPR soulad. Webové stránky pro advokáty za 2 týdny.",
  keywords: [
    "web pro právníky",
    "webové stránky pro advokáty",
    "web pro advokátní kancelář",
    "web pro právníka",
    "webové stránky advokát",
    "web advokátní kancelář",
    "web pro advokáta",
    "právnický web",
    "prezentace advokáta",
    "web pro notáře",
  ],
  openGraph: {
    title: "Web pro právníky | Od 9 990 Kč | Weblyx",
    description:
      "⚡ Profesionální web pro právníky a advokátní kanceláře od 9 990 Kč.",
    url: "https://www.weblyx.cz/web-pro-pravniky",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Weblyx - Web pro právníky" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Web pro právníky | Od 9 990 Kč | Weblyx",
    description: "⚡ Profesionální web pro právníky a advokátní kanceláře od 9 990 Kč.",
  },
  alternates: {
    canonical: "https://www.weblyx.cz/web-pro-pravniky",
    languages: getAlternateLanguages("/web-pro-pravniky"),
  },
};

const LAWYER_FEATURES = [
  {
    icon: Scale,
    title: "Přehled právních služeb",
    description: "Strukturovaná prezentace oblastí práva, ve kterých se specializujete. Klient okamžitě ví, zda jste ten pravý advokát.",
  },
  {
    icon: CalendarCheck,
    title: "Online objednávky konzultací",
    description: "Klienti si rezervují konzultaci přímo přes web. Šetří čas vám i jim. Automatické potvrzení a připomínky.",
  },
  {
    icon: Lock,
    title: "Klientský portál",
    description: "Zabezpečená zóna pro sdílení dokumentů s klienty. Komunikace na jednom místě, v souladu s advokátní mlčenlivostí.",
  },
  {
    icon: FileText,
    title: "Blog a právní poradenství",
    description: "Sekce pro články z vašeho oboru. Buduje autoritu, přivádí organickou návštěvnost a pomáhá s SEO.",
  },
  {
    icon: Users,
    title: "Profily advokátů",
    description: "Jednotlivé profily členů kanceláře s fotografiemi, specializacemi a zkušenostmi. Buduje důvěru.",
  },
  {
    icon: Shield,
    title: "GDPR a bezpečnost",
    description: "Web plně v souladu s GDPR a požadavky ČAK. SSL šifrování, zabezpečené formuláře, ochrana osobních údajů.",
  },
  {
    icon: Search,
    title: "SEO optimalizace",
    description: "Dostaňte se na první pozice pro „advokát [město]" a vaše specializace. Lokální SEO pro právníky.",
  },
  {
    icon: BookOpen,
    title: "Reference a případové studie",
    description: "Prezentace úspěšně řešených případů (anonymizovaně). Sociální důkaz, který přesvědčí potenciální klienty.",
  },
];

const FAQS = [
  {
    question: "Kolik stojí web pro advokátní kancelář?",
    answer:
      "Webové stránky pro advokáty začínají od 9 990 Kč. Profesionální web s klientským portálem a online objednávkami od 16 990 Kč. V ceně je vždy design na míru, SEO optimalizace, GDPR soulad a mobilní responzivita.",
  },
  {
    question: "Je web v souladu s pravidly ČAK?",
    answer:
      "Ano, při tvorbě webu pro advokáty důsledně dbáme na dodržení etických pravidel České advokátní komory. Web neobsahuje zakázanou reklamu a respektuje pravidla pro prezentaci advokátních služeb.",
  },
  {
    question: "Jak je zabezpečen klientský portál?",
    answer:
      "Klientský portál je chráněn SSL šifrováním, dvoufaktorovým ověřením a šifrovaným přenosem dokumentů. Data jsou uložena v zabezpečeném cloudovém úložišti v souladu s GDPR a požadavky na advokátní mlčenlivost.",
  },
  {
    question: "Můžeme si web spravovat sami?",
    answer:
      "Samozřejmě. Každý web dodáváme s přehledným admin panelem, kde snadno aktualizujete texty, přidáváte články na blog nebo upravujete informace o službách. Na složitější změny jsme tu pro vás v rámci podpory.",
  },
];

export default function WebProPravnikyPage() {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: "Domů", url: "https://www.weblyx.cz" },
    { name: "Web pro právníky", url: "https://www.weblyx.cz/web-pro-pravniky" },
  ];

  const webpageSchema = generateWebPageSchema({
    name: "Web pro právníky",
    description: "Profesionální webové stránky pro advokáty a advokátní kanceláře od 9 990 Kč.",
    url: "https://www.weblyx.cz/web-pro-pravniky",
    breadcrumbs,
  });

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <JsonLd data={webpageSchema} />
      <JsonLd data={faqSchema} />

      <main className="min-h-screen">
        <Breadcrumbs items={[{ label: "Web pro právníky", href: "/web-pro-pravniky" }]} />

        {/* HERO */}
        <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto max-w-5xl text-center space-y-6">
            <Badge variant="secondary" className="mb-2">
              Pro advokáty a právní kanceláře
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Web pro právníky —{" "}
              <span className="text-primary">důvěryhodná online prezentace</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Profesionální <strong>webové stránky pro advokáty</strong> a <strong>advokátní kanceláře</strong>.
              Klientský portál, online objednávky, GDPR soulad. Od <strong>9 990 Kč</strong> s{" "}
              <Link href="/pagespeed-garance" className="text-primary hover:underline">
                garancí PageSpeed 90+
              </Link>.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <LeadButton href="/poptavka" size="lg" showArrow>
                Nezávazná poptávka
              </LeadButton>
              <Button asChild variant="outline" size="lg">
                <Link href="/portfolio">Naše reference</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* PROČ PRÁVNÍCI POTŘEBUJÍ WEB */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold">
                Proč advokát <span className="text-primary">potřebuje profesionální web</span>?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                <strong>82 % potenciálních klientů</strong> hledá právníka online. Vaše webová prezentace je první dojem — a v právu na prvním dojmu záleží.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-6 space-y-3">
                  <Shield className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold">Důvěryhodnost</h3>
                  <p className="text-muted-foreground">
                    Profesionální <strong>web pro advokátní kancelář</strong> budí důvěru. Klient ví, s kým má tu čest, ještě před první schůzkou.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-6 space-y-3">
                  <Users className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold">Nový klienti</h3>
                  <p className="text-muted-foreground">
                    SEO optimalizovaný web přivádí nové klienty automaticky. Kdo hledá „<strong>advokát Praha</strong>", najde právě vás.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-6 space-y-3">
                  <CalendarCheck className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold">Efektivita</h3>
                  <p className="text-muted-foreground">
                    Online objednávky a klientský portál <strong>ušetří hodiny týdně</strong> na administrativě. Více času na to, co vás baví — právo.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-16 md:py-24 px-4 bg-muted/30">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12 space-y-3">
              <Badge variant="outline" className="mb-2">
                Funkce na míru
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Co obsahuje <span className="text-primary">web pro advokáty</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {LAWYER_FEATURES.map((feature) => (
                <Card key={feature.title} className="transition-all duration-300 hover:shadow-lg hover:border-primary/20">
                  <CardContent className="p-6 space-y-3">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-10">
              <p className="text-muted-foreground">
                Prohlédněte si{" "}
                <Link href="/sluzby" className="text-primary hover:underline">kompletní přehled služeb</Link>{" "}
                nebo se podívejte na{" "}
                <Link href="/portfolio" className="text-primary hover:underline">naše reference</Link>.
              </p>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ceník <span className="text-primary">webu pro právníky</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mt-10">
              <Card className="transition-all hover:shadow-lg">
                <CardHeader className="space-y-2 text-center">
                  <h3 className="text-xl font-bold">Prezentační web</h3>
                  <p className="text-3xl font-black text-primary">od 9 990 Kč</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-2 text-left">
                    {["Přehled služeb a specializací", "Profily advokátů", "Kontaktní formulář", "SEO optimalizace", "GDPR soulad", "Mobilní responzivita"].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" /> {f}
                      </li>
                    ))}
                  </ul>
                  <LeadButton href="/poptavka" variant="outline" className="w-full">
                    Nezávazná poptávka
                  </LeadButton>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/60 shadow-xl transition-all hover:shadow-2xl">
                <CardHeader className="space-y-2 text-center">
                  <Badge className="w-fit mx-auto">Doporučujeme</Badge>
                  <h3 className="text-xl font-bold">Web s portálem</h3>
                  <p className="text-3xl font-black text-primary">od 16 990 Kč</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-2 text-left">
                    {["Vše z prezentačního webu", "Klientský portál", "Online objednávky", "Blog sekce", "Případové studie", "Zabezpečené sdílení dokumentů"].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" /> {f}
                      </li>
                    ))}
                  </ul>
                  <LeadButton href="/poptavka" className="w-full">
                    Nezávazná poptávka
                  </LeadButton>
                </CardContent>
              </Card>
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              Zjistěte{" "}
              <Link href="/blog/analyzovali-jsme-50-ceskych-webu-prumerny-pagespeed-43" className="text-primary hover:underline">
                průměrný PageSpeed českých webů
              </Link>{" "}
              a proč na rychlosti webu záleží.
            </p>
          </div>
        </section>

        {/* RELATED */}
        <section className="py-12 px-4 bg-muted/20">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Další oborové weby
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/web-pro-zivnostniky" className="group">
                <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-md">
                  <CardContent className="p-5">
                    <h3 className="font-bold group-hover:text-primary transition-colors">Web pro živnostníky</h3>
                    <p className="text-sm text-muted-foreground mt-1">Cenově dostupný web pro OSVČ</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/web-pro-restaurace" className="group">
                <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-md">
                  <CardContent className="p-5">
                    <h3 className="font-bold group-hover:text-primary transition-colors">Web pro restaurace</h3>
                    <p className="text-sm text-muted-foreground mt-1">S online jídelním lístkem</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/redesign-webu" className="group">
                <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-md">
                  <CardContent className="p-5">
                    <h3 className="font-bold group-hover:text-primary transition-colors">Redesign webu</h3>
                    <p className="text-sm text-muted-foreground mt-1">Modernizace zastaralého webu</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">
                Časté dotazy — <span className="text-primary">web pro advokáty</span>
              </h2>
            </div>
            <div className="space-y-4">
              {FAQS.map((faq, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-6">
              Další otázky zodpovíme na stránce{" "}
              <Link href="/faq" className="text-primary hover:underline">často kladené otázky</Link>{" "}
              nebo nás <Link href="/kontakt" className="text-primary hover:underline">kontaktujte</Link>.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-4xl">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-8 md:p-12 text-center space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Potřebujete <span className="text-primary">web pro vaši kancelář</span>?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Vyplňte <Link href="/poptavka" className="text-primary hover:underline font-semibold">nezávaznou poptávku</Link> a do 24 hodin vám připravíme nabídku webu šitého na míru vaší advokátní kanceláři.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <LeadButton href="/poptavka" size="lg" showArrow>
                    Nezávazná poptávka
                  </LeadButton>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/kontakt">Kontaktujte nás</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </>
  );
}
