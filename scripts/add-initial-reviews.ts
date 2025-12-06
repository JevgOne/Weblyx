import { createReview } from '../lib/turso/reviews';

const reviews = [
  {
    authorName: "Martin Novák",
    authorRole: "Majitel, Titan Boxing",
    rating: 5,
    text: "Weblyx nám vytvořil perfektní web za neuvěřitelných 5 dní. PageSpeed 98/100, moderní design a vše přesně podle našich představ. Konečně máme web, který nezpomaluje zákazníky!",
    date: new Date('2025-01-15'),
    source: "Google",
    featured: true,
    published: true
  },
  {
    authorName: "Jana Veselá",
    authorRole: "Jednatelka, CarMakléř",
    rating: 5,
    text: "Přechod z WordPressu na Next.js byl nejlepší rozhodnutí. Web je 10x rychlejší, administrace jednoduchá a SEO pozice se zlepšily během měsíce. Doporučuji!",
    date: new Date('2025-01-10'),
    source: "Google",
    featured: true,
    published: true
  },
  {
    authorName: "Petr Dvořák",
    authorRole: "Živnostník, PD Stavby",
    rating: 5,
    text: "Za 7 990 Kč jsem dostal profesionální web, který vypadá na milion. Rychlý, responzivní, SEO optimalizovaný. Klienti mě teď vnímají úplně jinak. Super práce!",
    date: new Date('2025-01-05'),
    source: "Facebook",
    featured: true,
    published: true
  },
  {
    authorName: "Lucie Černá",
    authorRole: "Majitelka, Salon Lucie",
    rating: 5,
    text: "Komunikace na jedničku, termíny dodrženy, cena férová. Web funguje perfektně a objednávky jdou nahoru. Weblyx určitě doporučím svým známým!",
    date: new Date('2024-12-28'),
    source: "Google",
    featured: false,
    published: true
  },
  {
    authorName: "Tomáš Svoboda",
    authorRole: "CEO, TechStart",
    rating: 5,
    text: "Potřebovali jsme rychlý web pro náš startup. Weblyx dodal za týden, web letí jako střela a investoři byli nadšení z prezentace. PageSpeed 95+ je prostě znát!",
    date: new Date('2024-12-20'),
    source: "Google",
    featured: false,
    published: true
  },
  {
    authorName: "Markéta Horáková",
    authorRole: "Majitelka, Café Relax",
    rating: 5,
    text: "Konečně web, který se načítá okamžitě! Zákazníci oceňují online menu a rezervační formulář. Za tu cenu jsem nečekala takovou kvalitu. Děkuji!",
    date: new Date('2024-12-15'),
    source: "Facebook",
    featured: false,
    published: true
  }
];

async function main() {
  console.log('🚀 Přidávám reviews do databáze...\n');

  for (const review of reviews) {
    try {
      const created = await createReview(review);
      console.log(`✅ Přidána recenze: ${created.authorName} (${created.rating}⭐)`);
    } catch (error) {
      console.error(`❌ Chyba při přidání recenze ${review.authorName}:`, error);
    }
  }

  console.log('\n✨ Hotovo! Reviews přidány.');
}

main();
