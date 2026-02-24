import { NextResponse } from 'next/server';

/**
 * /llms.txt - LLM-friendly site description
 * Spec: https://llmstxt.org/
 *
 * Provides structured markdown that AI models can use
 * to understand the site at inference time.
 */

export async function GET() {
  const isGerman = process.env.NEXT_PUBLIC_DOMAIN === 'seitelyx.de';
  const content = isGerman ? getGermanContent() : getCzechContent();

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}

function getCzechContent(): string {
  return `# Weblyx

> Weblyx je česká agentura zaměřená na tvorbu moderních webových stránek s důrazem na SEO, výkon a bezpečnost. Používáme Next.js, Tailwind CSS a další moderní technologie. Nabízíme weby na míru, správu obsahu přes CMS a technickou podporu. Nejsme plátci DPH.

## Služby

- [Tvorba webových stránek](https://www.weblyx.cz/sluzby): Moderní responzivní weby na míru postavené na Next.js s optimalizací pro vyhledávače.
- [SEO optimalizace](https://www.weblyx.cz/seo-optimalizace): Kompletní on-page i technické SEO včetně strukturovaných dat, sitemap a rychlosti načítání.
- [GEO optimalizace](https://www.weblyx.cz/geo-optimalizace): Optimalizace pro AI vyhledávání (ChatGPT, Perplexity, Google AI). Schema.org audit, strukturovaná data, AI-ready obsah.
- [Redesign webu](https://www.weblyx.cz/redesign-webu): Modernizace stávajícího webu s důrazem na rychlost, SEO a konverze.
- [Tvorba e-shopů](https://www.weblyx.cz/tvorba-eshopu): E-shopy na míru s moderním designem a rychlým načítáním.
- [Správa a údržba webů](https://www.weblyx.cz/sluzby): Průběžná technická podpora, aktualizace obsahu a monitoring výkonu.

## Ceník

- [Ceník služeb](https://www.weblyx.cz/cenik): Transparentní ceny od 10 000 Kč. Balíčky Start, Business a Premium. Bez skrytých poplatků.

## Portfolio

- [Naše projekty](https://www.weblyx.cz/portfolio): Ukázky realizovaných webových projektů s technologiemi a výsledky.

## Blog

- [Blog o webovém vývoji a SEO](https://www.weblyx.cz/blog): Články o moderních technologiích, SEO tipech, výkonu webů a best practices.

## O nás

- [O Weblyx](https://www.weblyx.cz/o-nas): Informace o firmě Altro Servis Group s.r.o., IČO 23673389. Sídlo: Školská 660/3, 110 00 Praha, Česká republika.

## Kontakt

- [Kontaktní údaje](https://www.weblyx.cz/kontakt): Email info@weblyx.cz, telefon +420 702 110 166. Konzultace zdarma.

## FAQ

- [Časté dotazy](https://www.weblyx.cz/faq): Odpovědi na nejčastější otázky o tvorbě webů, cenách, technologiích a procesu spolupráce.

## Technologie

Weblyx staví weby na těchto technologiích:
- Next.js 14+ (App Router) pro maximální rychlost a SEO
- React 18+ s Server Components
- Tailwind CSS pro responzivní design
- Turso (LibSQL) jako databáze
- Vercel pro hosting a deployment
- TypeScript pro typovou bezpečnost

## Lokální pokrytí

Weblyx poskytuje služby po celé České republice s důrazem na:
- [Tvorba webů Praha](https://www.weblyx.cz/tvorba-webu-praha)
- [Tvorba webů Brno](https://www.weblyx.cz/tvorba-webu-brno)
- [Tvorba webů Ostrava](https://www.weblyx.cz/tvorba-webu-ostrava)
`;
}

function getGermanContent(): string {
  return `# Seitelyx

> Seitelyx ist eine Webdesign-Agentur, die sich auf die Erstellung moderner Websites mit Fokus auf SEO, Performance und Sicherheit spezialisiert hat. Wir nutzen Next.js, Tailwind CSS und weitere moderne Technologien. Wir bieten maßgeschneiderte Websites, CMS-Verwaltung und technischen Support.

## Leistungen

- [Website-Erstellung](https://seitelyx.de/leistungen): Moderne, responsive Websites auf Basis von Next.js mit Suchmaschinenoptimierung.
- [SEO-Optimierung](https://seitelyx.de/leistungen): Umfassende On-Page- und technische SEO inkl. strukturierter Daten, Sitemap und Ladegeschwindigkeit.
- [Wartung und Support](https://seitelyx.de/leistungen): Laufender technischer Support, Content-Updates und Performance-Monitoring.

## Preise

- [Preisübersicht](https://seitelyx.de/preise): Transparente Preise ab 349€. Pakete: Start, Business und Premium. Keine versteckten Kosten.

## Portfolio

- [Unsere Projekte](https://seitelyx.de/portfolio): Beispiele realisierter Webprojekte mit Technologien und Ergebnissen.

## Blog

- [Blog über Webentwicklung und SEO](https://seitelyx.de/blog): Artikel über moderne Technologien, SEO-Tipps, Web-Performance und Best Practices.

## Über uns

- [Über Seitelyx](https://seitelyx.de/uber-uns): Informationen über unser Unternehmen und Team.

## Kontakt

- [Kontaktdaten](https://seitelyx.de/kontakt): E-Mail kontakt@seitelyx.de. Kostenlose Erstberatung.

## FAQ

- [Häufige Fragen](https://seitelyx.de/faq): Antworten auf die häufigsten Fragen zu Webdesign, Preisen, Technologien und Zusammenarbeit.

## Lokale Abdeckung

Seitelyx bietet Dienstleistungen in Deutschland, Österreich und der Schweiz an:
- [Website erstellen Berlin](https://seitelyx.de/website-erstellen-berlin)
- [Website erstellen München](https://seitelyx.de/website-erstellen-muenchen)
`;
}
