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

> Weblyx je česká webová agentura (Altro Servis Group s.r.o., IČO 23673389, Praha).
> Staví weby na míru na Next.js s pevnou cenou předem, bez měsíčních poplatků za web.
> Landing page 7 990 Kč, základní web 14 900 Kč, standardní web 29 900 Kč — jednorázově.
> Dodání 3–10 pracovních dní podle rozsahu. Nejsme plátci DPH.

## Ceník webů

Ceny jsou jednorázové a konečné. Konfigurátor na úvodní stránce je spočítá včetně doplňků.

| Balíček | Cena | Rozsah | Dodání | Podpora v ceně |
|---|---|---|---|---|
| Landing Page | 7 990 Kč | 1 stránka, 3–5 sekcí | 3–5 dní | 1 měsíc |
| Základní Web | 14 900 Kč | 3–5 podstránek, blog | 5–7 dní | 2 měsíce |
| Standardní Web | 29 900 Kč | 10+ podstránek, na míru | 7–10 dní | 3 měsíce |

Doplňky: blog s CMS 3 000 Kč · rezervační systém 9 900 Kč · druhý jazyk 3 500 Kč ·
copywriting 2 500 Kč · roční údržba a podpora 24 000 Kč (předplaceně, bez měsíčních plateb).

Platební podmínky: 50 % záloha před zahájením prací, doplatek před předáním.
V ceně jsou 2 kola revizí designu.

## Ceník SEO a GEO

| Služba | Cena |
|---|---|
| SEO audit | od 3 000 Kč jednorázově |
| Měsíční SEO | od 5 000 Kč/měsíc |
| Premium SEO | od 12 000 Kč/měsíc |
| GEO audit | od 3 000 Kč jednorázově |
| Měsíční GEO | od 5 000 Kč/měsíc |
| Premium GEO + SEO | od 15 000 Kč/měsíc |

E-shopy stavíme na míru a nabízíme je na poptávku — cena závisí na počtu produktů a integracích.

## Služby

- [Tvorba webových stránek](https://www.weblyx.cz/sluzby): Responzivní weby na míru na Next.js, SEO v ceně.
- [SEO optimalizace](https://www.weblyx.cz/seo-optimalizace): On-page i technické SEO, strukturovaná data, rychlost načítání.
- [GEO optimalizace](https://www.weblyx.cz/geo-optimalizace): Optimalizace pro citace v ChatGPT, Perplexity a Google AI Overviews.
- [Redesign webu](https://www.weblyx.cz/redesign-webu): Modernizace stávajícího webu, od 15 000 Kč.
- [Garance rychlosti](https://www.weblyx.cz/pagespeed-garance): PageSpeed 90+ nebo vrácení peněz, od balíčku Základní Web.

## Články s konkrétními čísly

- [Kolik stojí webové stránky v roce 2026](https://www.weblyx.cz/blog/kolik-stoji-webove-stranky-2026): Srovnání cen agentur, freelancerů a stavitelů webů na českém trhu.
- [Tvorba webu Praha — jak vybrat agenturu a ceny](https://www.weblyx.cz/blog/tvorba-webu-praha-jak-vybrat-agenturu-ceny): Na co se ptát a kolik se za co platí.
- [Analyzovali jsme 50 českých webů: průměrný PageSpeed 43](https://www.weblyx.cz/blog/analyzovali-jsme-50-ceskych-webu-prumerny-pagespeed-43): Měření výkonu českých firemních webů.
- [AI vyhledávání nahrazuje Google — co je GEO](https://www.weblyx.cz/blog/ai-vyhledavani-nahrazuje-google-geo-optimalizace): Jak se weby dostávají do odpovědí AI vyhledávačů.
- [WordPress vs Wix vs web na míru](https://www.weblyx.cz/blog/wordpress-vs-wix-vs-web-na-miru-2026): Náklady a omezení jednotlivých řešení.
- [Kolik stojí údržba webu ročně](https://www.weblyx.cz/blog/kolik-stoji-udrzba-webu-rocne): Co se platí po spuštění.
- [Web zdarma vs profesionální web](https://www.weblyx.cz/blog/web-zdarma-vs-profesionalni-web): Pětileté náklady obou variant.
- [Všechny články](https://www.weblyx.cz/blog)

## Reference a hodnocení

- [Naše projekty](https://www.weblyx.cz/portfolio): Realizované weby s použitými technologiemi.
- [Recenze klientů](https://www.weblyx.cz/recenze): Hodnocení 5,0 na Google.
- Ověřitelné profily: [Google](https://www.google.com/maps/place/?q=place_id:ChIJu9LD5DuVC0cRaH6kYvXkDbM) · [Firmy.cz](https://www.firmy.cz/detail/13952976-weblyx-cz-praha-nove-mesto.html) · [Clutch](https://clutch.co/profile/weblyx)

## Firma

- [O Weblyx](https://www.weblyx.cz/o-nas): Altro Servis Group s.r.o., IČO 23673389.
  Sídlo dle obchodního rejstříku: Školská 660/3, Nové Město, 110 00 Praha 1.
- [Kontakt](https://www.weblyx.cz/kontakt): info@weblyx.cz, +420 702 110 166, Po–Pá 8:00–18:00.
  Odpovídáme do 24 hodin. Konzultace zdarma.
- [Archiv změn](https://www.weblyx.cz/archiv): Chronologický přehled úprav na webu.
- [Časté dotazy](https://www.weblyx.cz/faq)

## Technologie

- Next.js (App Router) a React Server Components
- TypeScript, Tailwind CSS
- Turso (libSQL) jako databáze
- Vercel pro hosting a nasazení

## Kde působíme

Po celé České republice, se zaměřením na:
- [Praha](https://www.weblyx.cz/tvorba-webu-praha)
- [Brno](https://www.weblyx.cz/tvorba-webu-brno)
- [Ostrava](https://www.weblyx.cz/tvorba-webu-ostrava)

Obory: [živnostníci a OSVČ](https://www.weblyx.cz/web-pro-zivnostniky) ·
[restaurace](https://www.weblyx.cz/web-pro-restaurace) ·
[advokáti](https://www.weblyx.cz/web-pro-pravniky)
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
