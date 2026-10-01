import type { Metadata } from "next";
import { LandingFaq, type Faq } from "@/components/landing/LandingFaq";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateWebPageSchema, generateBreadcrumbSchema } from "@/lib/schema-org";

export const metadata: Metadata = {
  title: "Obchodní podmínky — záloha, termíny a reklamace",
  description: "Závazné podmínky spolupráce: po schválení cenové nabídky záloha 50 %, doplatek před předáním. Termín dodání, co se stane při jeho nedodržení, revize a reklamace.",
  openGraph: {
    title: "Obchodní podmínky | Weblyx",
    description: "Všeobecné obchodní podmínky poskytování služeb.",
    type: "website",
    locale: "cs_CZ",
    siteName: "Weblyx",
  },
  twitter: {
    card: "summary",
    title: "Obchodní podmínky | Weblyx",
    description: "Všeobecné obchodní podmínky poskytování služeb.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.weblyx.cz/obchodni-podminky",
  },
};

const VOP_FAQ: Faq[] = [
  {
    question: "Kdy se platí záloha a kolik?",
    answer:
      "Po schválení cenové nabídky klient hradí zálohu 50 %, doplatek je splatný před předáním hotového díla. Prací začínáme až po uhrazení zálohy.",
  },
  {
    question: "Od čeho se počítá termín dodání?",
    answer:
      "Termín začíná běžet dnem, kdy je uhrazená záloha a zároveň klient dodal všechny potřebné podklady — texty, loga, fotografie a přístupy. Nastanou-li tyto skutečnosti v různé dny, rozhoduje ten pozdější. Nepočítá se od prvního kontaktu ani od odeslání poptávky.",
  },
  {
    question: "Co se stane, když termín nedodržíte?",
    answer:
      "Celková cena zakázky se snižuje na 50 % původně sjednané ceny. Uhrazená záloha se pak považuje za úhradu celé zakázky a doplatek klient neplatí.",
  },
  {
    question: "Kolik je v ceně revizí?",
    answer:
      "Dvě kola revizí designu. Pokud klient ani po nich není spokojen, vrací se záloha.",
  },
  {
    question: "Komu bude patřit web a doména?",
    answer:
      "Dílo i doména jsou klienta. Doporučujeme ověřit si u každého dodavatele, kdo je zapsaný jako držitel domény v registru CZ.NIC — rozhoduje to, ne kdo ji platí nebo spravuje.",
  },
];

export default function TermsPage() {
  const breadcrumbs = [
    { name: "Domů", url: "https://www.weblyx.cz" },
    { name: "Obchodní podmínky", url: "https://www.weblyx.cz/obchodni-podminky" },
  ];

  return (
    <>
      <JsonLd data={generateWebPageSchema({ name: "Obchodní podmínky", description: "Závazné podmínky spolupráce: záloha 50 % po schválení nabídky, termíny dodání, revize a reklamace.", url: "https://www.weblyx.cz/obchodni-podminky", breadcrumbs })} />
      <JsonLd data={generateBreadcrumbSchema(breadcrumbs)} />
    <main className="min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-4xl prose prose-lg">
        <h1>Obchodní podmínky</h1>
        <p className="lead">Poslední aktualizace: 19. listopadu 2025</p>

        <h2>1. Základní ustanovení</h2>
        <p>
          Tyto obchodní podmínky upravují vztahy mezi poskytovatelem služeb:
        </p>
        <p>
          <strong>Altro Servis Group s.r.o.</strong><br />
          IČO: 23673389<br />
          Sídlo: Školská 660/3, Nové Město (Praha 1), 110 00 Praha<br />
          Email: info@weblyx.cz<br />
          Telefon: +420 702 110 166<br />
          (dále jen "poskytovatel")
        </p>
        <p>
          a klientem (dále jen "klient").
        </p>

        <h2>2. Vymezení pojmů</h2>
        <ul>
          <li><strong>Služba</strong>: Tvorba webových stránek, e-shopů, SEO optimalizace a další služby uvedené na webu</li>
          <li><strong>Projekt</strong>: Konkrétní zakázka dohodnutá mezi poskytovatelem a klientem</li>
          <li><strong>Smlouva</strong>: Písemná nebo elektronická dohoda o poskytnutí služeb</li>
        </ul>

        <h2>3. Objednávka a uzavření smlouvy</h2>
        <p>
          Smlouva je uzavřena potvrzením cenové nabídky klientem a zaplacením zálohy.
          Poskytovatel si vyhrazuje právo odmítnout zakázku.
        </p>

        <h2>4. Cena a platební podmínky</h2>
        <ul>
          <li>Ceny jsou uvedeny včetně DPH (pokud je poskytovatel plátcem)</li>
          <li>Po schválení cenové nabídky klient hradí zálohu 50 %; prací začínáme až po jejím uhrazení</li>
          <li>Zbývající část je splatná před předáním hotového projektu</li>
          <li>Splatnost faktur je 14 dní od vystavení</li>
        </ul>

        <h2>5. Průběh realizace</h2>
        <p>Projekt probíhá ve fázích:</p>
        <ol>
          <li>Konzultace a specifikace požadavků</li>
          <li>Návrh designu a schválení klientem</li>
          <li>Vývoj a programování</li>
          <li>Testování a revize</li>
          <li>Spuštění a předání</li>
        </ol>

        <h2>6. Práva a povinnosti stran</h2>
        <h3>Povinnosti poskytovatele:</h3>
        <ul>
          <li>Poskytnou služby v dohodnutém rozsahu a kvalitě</li>
          <li>Dodržet sjednané termíny</li>
          <li>Informovat klienta o průběhu projektu</li>
        </ul>

        <h3>Nedodržení termínu dodání:</h3>
        <p>
          Termín dodání začíná běžet dnem, kdy jsou splněny obě tyto podmínky
          zároveň: klient uhradil zálohu a současně dodal všechny podklady
          potřebné pro vytvoření webu (texty, loga, fotografie, potřebné
          přístupy). Nastanou-li tyto skutečnosti v různé dny, běží lhůta od té
          pozdější. Termín neběží od prvního kontaktu ani od odeslání poptávky.
        </p>
        <p>
          Pokud poskytovatel nedodá dílo ve sjednaném termínu, snižuje se
          celková cena zakázky na 50 % původně sjednané ceny. Uhrazená záloha se
          v takovém případě považuje za úhradu celé zakázky a doplatek klient
          neplatí.
        </p>
        <p>
          Lhůta se staví po dobu, kdy poskytovatel čeká na doplnění podkladů
          nebo na vyjádření klienta podle bodu „Povinnosti klienta“.
        </p>

        <h3>Povinnosti klienta:</h3>
        <ul>
          <li>Poskytnout všechny potřebné podklady (texty, loga, fotky)</li>
          <li>Včas se vyjadřovat k návrhům a požadavkům</li>
          <li>Uhradit dohodnutou cenu</li>
        </ul>

        <h2>7. Reklamace</h2>
        <p>
          Klient má právo reklamovat vady do 30 dnů od předání projektu. Reklamace musí být
          uplatněna písemně s popisem vady.
        </p>

        <h2>8. Autorská práva</h2>
        <p>
          Po úhradě celé ceny přechází na klienta právo užívat dodaný web. Poskytovatel si
          vyhrazuje právo uvést projekt ve svém portfoliu.
        </p>

        <h2>9. Ochrana osobních údajů</h2>
        <p>
          Zpracování osobních údajů se řídí dokumentem{" "}
          <a href="/ochrana-udaju">Ochrana osobních údajů</a>.
        </p>

        <h2>10. Závěrečná ustanovení</h2>
        <p>
          Tyto obchodní podmínky jsou platné a účinné od 19. listopadu 2025. Poskytovatel si
          vyhrazuje právo tyto podmínky změnit.
        </p>

        <h2>11. Kontakt</h2>
        <p>
          <strong>Altro Servis Group s.r.o.</strong><br />
          IČO: 23673389<br />
          Sídlo: Školská 660/3, Nové Město (Praha 1), 110 00 Praha<br />
          Email: <a href="mailto:info@weblyx.cz" className="text-primary hover:underline">info@weblyx.cz</a><br />
          Telefon: <a href="tel:+420702110166" className="text-primary hover:underline">+420 702 110 166</a>
        </p>
      </div>
      <LandingFaq items={VOP_FAQ} />
    </main>
    </>
  );
}
