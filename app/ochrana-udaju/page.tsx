import type { Metadata } from "next";
import { LandingFaq, type Faq } from "@/components/landing/LandingFaq";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateWebPageSchema, generateBreadcrumbSchema } from "@/lib/schema-org";

export const metadata: Metadata = {
  title: "Ochrana osobních údajů — co sbíráme a proč",
  description: "Jaké údaje sbíráme z poptávkového formuláře a analytiky, jak dlouho je držíme, komu je předáváme a jak si vyžádáte jejich výmaz. V souladu s GDPR.",
  openGraph: {
    title: "Ochrana osobních údajů | Weblyx",
    description: "Zásady ochrany osobních údajů a GDPR compliance.",
    type: "website",
    locale: "cs_CZ",
    siteName: "Weblyx",
  },
  twitter: {
    card: "summary",
    title: "Ochrana osobních údajů | Weblyx",
    description: "Zásady ochrany osobních údajů a GDPR compliance.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.weblyx.cz/ochrana-udaju",
  },
};

const GDPR_FAQ: Faq[] = [
  {
    question: "Jaké údaje o mně sbíráte?",
    answer:
      "Z poptávkového formuláře jméno, e-mail, telefon a popis zakázky. Z analytiky anonymizované údaje o návštěvě a u příchodu z reklamy i označení kampaně. Nic z toho neprodáváme.",
  },
  {
    question: "Jak dlouho údaje uchováváte?",
    answer:
      "Po dobu nezbytnou pro vyřízení poptávky a splnění zákonných povinností. Když o výmaz požádáte dřív, provedeme ho — pokud nám jeho uchování neukládá zákon, typicky u účetních dokladů.",
  },
  {
    question: "Jak si vyžádám výmaz nebo výpis?",
    answer:
      "Napište na info@weblyx.cz. Máte právo na přístup k údajům, jejich opravu, výmaz, omezení zpracování i na přenositelnost.",
  },
  {
    question: "Používáte cookies a musím je přijmout?",
    answer:
      "Nezbytné cookies web potřebuje k provozu. Analytické a marketingové se spouštějí až po vašem souhlasu — dokud ho nedáte, neměří se nic. Souhlas můžete kdykoli změnit.",
  },
];

export default function PrivacyPage() {
  const breadcrumbs = [
    { name: "Domů", url: "https://www.weblyx.cz" },
    { name: "Ochrana osobních údajů", url: "https://www.weblyx.cz/ochrana-udaju" },
  ];

  return (
    <>
      <JsonLd data={generateWebPageSchema({ name: "Ochrana osobních údajů", description: "Jaké osobní údaje zpracováváme, jak dlouho je držíme a jak si vyžádáte jejich výmaz.", url: "https://www.weblyx.cz/ochrana-udaju", breadcrumbs })} />
      <JsonLd data={generateBreadcrumbSchema(breadcrumbs)} />
    <main className="min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-4xl prose prose-lg">
        <h1>Ochrana osobních údajů</h1>
        <p className="lead">Poslední aktualizace: 19. listopadu 2025</p>

        <h2>1. Správce osobních údajů</h2>
        <p>
          Správcem vašich osobních údajů je:
        </p>
        <p>
          <strong>Altro Servis Group s.r.o.</strong><br />
          IČO: 23673389<br />
          Sídlo: Školská 660/3, Nové Město (Praha 1), 110 00 Praha<br />
          Email: info@weblyx.cz<br />
          Telefon: +420 702 110 166
        </p>

        <h2>2. Jaké údaje sbíráme</h2>
        <p>Při používání našich služeb můžeme sbírat následující osobní údaje:</p>
        <ul>
          <li>Jméno a příjmení</li>
          <li>Emailovou adresu</li>
          <li>Telefonní číslo</li>
          <li>Informace o vašem projektu z kontaktního formuláře</li>
          <li>Technické údaje (IP adresa, typ prohlížeče) prostřednictvím cookies</li>
        </ul>

        <h2>3. Účel zpracování</h2>
        <p>Vaše osobní údaje zpracováváme za následujícími účely:</p>
        <ul>
          <li>Odpověď na vaše dotazy a poptávky</li>
          <li>Zpracování objednávek a komunikace ohledně projektů</li>
          <li>Zlepšování našich služeb a webových stránek</li>
          <li>Zasílání marketingových sdělení (pouze se souhlasem)</li>
        </ul>

        <h2>4. Právní základ zpracování</h2>
        <p>Osobní údaje zpracováváme na základě:</p>
        <ul>
          <li>Vašeho souhlasu</li>
          <li>Plnění smlouvy</li>
          <li>Našich oprávněných zájmů</li>
          <li>Právních povinností</li>
        </ul>

        <h2>5. Doba uchování</h2>
        <p>
          Osobní údaje uchováváme po dobu nezbytnou pro splnění účelů, pro které byly získány,
          nebo po dobu stanovenou zákonem (obvykle 5 let pro daňové účely).
        </p>

        <h2>6. Vaše práva</h2>
        <p>V souvislosti se zpracováním osobních údajů máte následující práva:</p>
        <ul>
          <li>Právo na přístup k osobním údajům</li>
          <li>Právo na opravu</li>
          <li>Právo na výmaz (&quot;právo být zapomenut&quot;)</li>
          <li>Právo na omezení zpracování</li>
          <li>Právo na přenositelnost údajů</li>
          <li>Právo vznést námitku proti zpracování</li>
          <li>Právo odvolat souhlas</li>
        </ul>

        <h2>7. Cookies</h2>
        <p>
          Naše webové stránky používají cookies pro zlepšení uživatelské zkušenosti a analytické
          účely. Více informací naleznete v našich{" "}
          <a href="/cookies" className="text-primary hover:underline">zásadách cookies</a>.
        </p>

        <h2>8. Kontakt</h2>
        <p>
          V případě dotazů ohledně ochrany osobních údajů nás můžete kontaktovat na:
        </p>
        <p>
          <strong>Altro Servis Group s.r.o.</strong><br />
          IČO: 23673389<br />
          Sídlo: Školská 660/3, Nové Město (Praha 1), 110 00 Praha<br />
          Email: <a href="mailto:info@weblyx.cz" className="text-primary hover:underline">info@weblyx.cz</a><br />
          Telefon: <a href="tel:+420702110166" className="text-primary hover:underline">+420 702 110 166</a>
        </p>
      </div>
      <LandingFaq items={GDPR_FAQ} />
    </main>
    </>
  );
}
