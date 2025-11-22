#!/usr/bin/env tsx
/**
 * Seed Turso CMS with data from hardcoded components
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { turso } from '../lib/turso';

async function seedCMSData() {
  // Pricing data from components/home/pricing.tsx
  const pricingTiers = [
    {
      id: 'tier-1',
      name: 'Landing Page',
      description: 'Levnější než WordPress, rychlejší než konkurence',
      price: 7990,
      currency: 'CZK',
      billing_period: 'one-time',
      features: JSON.stringify([
        '1 stránka, 3–5 sekcí',
        'Responzivní design',
        'Kontaktní formulář',
        'SEO základy',
        'Google Analytics',
        'Dodání za 3–5 dní',
        '1 měsíc podpora'
      ]),
      highlighted: 0,
      order: 1,
      active: 1
    },
    {
      id: 'tier-2',
      name: 'Základní Web',
      description: 'Moderní web bez zbytečností',
      price: 9990,
      currency: 'CZK',
      billing_period: 'one-time',
      features: JSON.stringify([
        '3–5 podstránek',
        'Moderní design',
        'Pokročilé SEO',
        'Blog s CMS editorem',
        'Kontaktní formulář',
        'Napojení na sociální sítě',
        'Dodání za 5–7 dní',
        '2 měsíce podpora'
      ]),
      highlighted: 0,
      order: 2,
      active: 1
    },
    {
      id: 'tier-3',
      name: 'Standardní Web',
      description: 'Co konkurence dělá za 40k a měsíc, my za 25k a týden',
      price: 24990,
      currency: 'CZK',
      billing_period: 'one-time',
      features: JSON.stringify([
        '10+ podstránek',
        'Premium design na míru',
        'Pokročilé animace',
        'Full CMS pro správu obsahu',
        'Rezervační systém',
        'Newsletter integrace',
        'Pokročilé SEO a Analytics',
        'Dodání za 7–10 dní',
        '3 měsíce podpora',
        'Bezplatné drobné úpravy (2h)'
      ]),
      highlighted: 1,
      order: 3,
      active: 1
    },
    {
      id: 'tier-4',
      name: 'Mini E-shop',
      description: 'Moderní e-shop bez WordPress limitů',
      price: 49990,
      currency: 'CZK',
      billing_period: 'one-time',
      features: JSON.stringify([
        'Do 50 produktů',
        'Platební brána',
        'Správa objednávek',
        'Kategorie a filtry',
        'Wishlist, košík, checkout',
        'Email notifikace',
        'SEO optimalizace',
        'Dodání za 14 dní',
        '6 měsíců podpora'
      ]),
      highlighted: 0,
      order: 4,
      active: 1
    },
    {
      id: 'tier-5',
      name: 'Premium E-shop',
      description: 'Enterprise řešení za poloviční cenu',
      price: 89990,
      currency: 'CZK',
      billing_period: 'one-time',
      features: JSON.stringify([
        'Neomezený počet produktů',
        'Více platebních bran',
        'Propojení s kurýry',
        'Pokročilé filtry a vyhledávání',
        'Uživatelské účty',
        'Kupóny a slevy',
        'Hodnocení produktů',
        'Multi-jazyk podpora',
        'Propojení s účetnictvím',
        'Dodání za 21–28 dní',
        '12 měsíců premium podpora'
      ]),
      highlighted: 0,
      order: 5,
      active: 1
    }
  ];

  // Process steps data from components/home/process.tsx
  const processSteps = [
    {
      id: 'step-1',
      title: 'Konzultace',
      description: 'Nezávazná konzultace zdarma, kde si vyslechneme vaše požadavky a cíle.',
      icon: 'MessageSquare',
      order: 1
    },
    {
      id: 'step-2',
      title: 'Návrh designu',
      description: 'Vytvoříme designový návrh, který odpovídá vaší značce a cílům.',
      icon: 'Palette',
      order: 2
    },
    {
      id: 'step-3',
      title: 'Vývoj',
      description: 'Vyvíjíme moderní web s důrazem na rychlost a uživatelskou zkušenost.',
      icon: 'Code',
      order: 3
    },
    {
      id: 'step-4',
      title: 'Testování',
      description: 'Důkladně otestujeme na všech zařízeních a prohlížečích.',
      icon: 'TestTube',
      order: 4
    },
    {
      id: 'step-5',
      title: 'Spuštění',
      description: 'Nasadíme web na produkci a zajistíme bezproblémový start.',
      icon: 'Rocket',
      order: 5
    },
    {
      id: 'step-6',
      title: 'Podpora',
      description: 'Poskytujeme technickou podporu a pomůžeme s dalším rozvojem.',
      icon: 'HeadphonesIcon',
      order: 6
    }
  ];

  // Process section meta
  const processSection = {
    id: 'current',
    title: 'Jak to funguje',
    subtitle: 'Náš proces je jednoduchý, transparentní a efektivní'
  };

  // FAQ section meta and items from lib/firebase-admin.ts
  const faqSection = {
    id: 'current',
    title: 'Často kladené otázky',
    subtitle: 'Odpovědi na nejčastější dotazy'
  };

  const faqItems = [
    {
      id: 'faq-1',
      question: 'Jak dlouho trvá vytvoření webu?',
      answer: 'Jednoduché webové stránky dodáme za 5-7 dní. Standardní weby s rozšířenými funkcemi obvykle trvají 10-14 dní. E-shopy a složitější projekty jsou individuální a závisí na rozsahu funkcí. Po úvodní konzultaci vám poskytneme přesný časový odhad.',
      order: 1
    },
    {
      id: 'faq-2',
      question: 'Kolik stojí webové stránky?',
      answer: 'Startovací cena je 10 000 Kč pro jednoduchý web s až 5 podstránkami. Standardní weby začínají na 25 000 Kč a e-shopy od 85 000 Kč. Finální cena závisí na počtu stránek, funkcích a designové složitosti. Po vyplnění dotazníku vám připravíme konkrétní nabídku.',
      order: 2
    },
    {
      id: 'faq-3',
      question: 'Poskytujete i doménu a hosting?',
      answer: 'Ano, můžeme zajistit doménu i hosting, nebo vám pomůžeme s nastavením, pokud už je máte. Doporučujeme kvalitní hosting pro optimální rychlost a bezpečnost vašeho webu. Cena hostingu začína na cca 100-300 Kč měsíčně podle typu webu.',
      order: 3
    },
    {
      id: 'faq-4',
      question: 'Mohu si web spravovat sám?',
      answer: 'Samozřejmě! Pokud chcete, implementujeme jednoduché CMS (Content Management System), které vám umožní měnit texty, přidávat fotky a publikovat články bez znalosti programování. Poskytneme vám také školení nebo video návod.',
      order: 4
    },
    {
      id: 'faq-5',
      question: 'Děláte i e-shopy?',
      answer: 'Ano, vytváříme plně funkční e-shopy s propojením na platební brány (GoPay, Stripe, PayPal), správou produktů, skladu a objednávek. E-shopy začínají na 85 000 Kč a zahrnují vše potřebné pro online prodej.',
      order: 5
    },
    {
      id: 'faq-6',
      question: 'Nabízíte následnou podporu?',
      answer: 'Ano, k jednoduchému webu poskytujeme 1 měsíc podpory zdarma, ke standardnímu 3 měsíce a k e-shopu 6 měsíců. Po této době můžete využít naše servisní balíčky nebo jednorázové úpravy podle potřeby.',
      order: 6
    },
    {
      id: 'faq-7',
      question: 'Jaké technologie používáte?',
      answer: 'Používáme moderní technologie jako Next.js, React a TypeScript pro maximální výkon a bezpečnost. Pro styling používáme Tailwind CSS. Backend řešíme přes Supabase nebo vlastní API. Všechny weby jsou responzivní a SEO optimalizované.',
      order: 7
    },
    {
      id: 'faq-8',
      question: 'Jak probíhá platba?',
      answer: 'Standardně vyžadujeme zálohu 50% před zahájením prací a zbytek před předáním hotového webu. U větších projektů můžeme dohodnout rozložení na více splátek. Platbu můžete provést fakturou s QR kódem nebo bankovním převodem.',
      order: 8
    }
  ];

  console.log('🚀 Starting migration to Turso CMS...\n');

  // Insert pricing tiers
  console.log('📊 Inserting pricing tiers...');
  let pricingCount = 0;
  for (const tier of pricingTiers) {
    await turso.execute({
      sql: `INSERT OR REPLACE INTO pricing_tiers
        (id, name, description, price, currency, billing_period, features, highlighted, "order", active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
      args: [
        tier.id,
        tier.name,
        tier.description,
        tier.price,
        tier.currency,
        tier.billing_period,
        tier.features,
        tier.highlighted,
        tier.order,
        tier.active
      ]
    });
    console.log(`  ✅ Added: ${tier.name} - ${tier.price} ${tier.currency}`);
    pricingCount++;
  }

  // Insert process steps
  console.log('\n🔄 Inserting process steps...');
  let processCount = 0;
  for (const step of processSteps) {
    await turso.execute({
      sql: `INSERT OR REPLACE INTO process_steps
        (id, title, description, icon, "order", created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
      args: [step.id, step.title, step.description, step.icon, step.order]
    });
    console.log(`  ✅ Added step ${step.order}: ${step.title}`);
    processCount++;
  }

  // Insert process section meta
  console.log('\n📝 Inserting process section metadata...');
  await turso.execute({
    sql: `INSERT OR REPLACE INTO process_section
      (id, title, subtitle, updated_at)
      VALUES (?, ?, ?, unixepoch())`,
    args: [processSection.id, processSection.title, processSection.subtitle]
  });
  console.log(`  ✅ Added section: ${processSection.title}`);

  // Insert FAQ items
  console.log('\n❓ Inserting FAQ items...');
  let faqCount = 0;
  for (const faq of faqItems) {
    await turso.execute({
      sql: `INSERT OR REPLACE INTO faq_items
        (id, question, answer, "order", created_at, updated_at)
        VALUES (?, ?, ?, ?, unixepoch(), unixepoch())`,
      args: [faq.id, faq.question, faq.answer, faq.order]
    });
    console.log(`  ✅ Added FAQ ${faq.order}: ${faq.question}`);
    faqCount++;
  }

  // Insert FAQ section meta
  console.log('\n📝 Inserting FAQ section metadata...');
  await turso.execute({
    sql: `INSERT OR REPLACE INTO faq_section
      (id, title, subtitle, updated_at)
      VALUES (?, ?, ?, unixepoch())`,
    args: [faqSection.id, faqSection.title, faqSection.subtitle]
  });
  console.log(`  ✅ Added section: ${faqSection.title}`);

  // Verify data
  console.log('\n🔍 Verifying data in database...\n');

  const pricingResult = await turso.execute('SELECT COUNT(*) as count FROM pricing_tiers WHERE active = 1');
  const processResult = await turso.execute('SELECT COUNT(*) as count FROM process_steps');
  const faqResult = await turso.execute('SELECT COUNT(*) as count FROM faq_items');

  console.log('📈 SUMMARY:');
  console.log(`  • Pricing tiers added: ${pricingCount}`);
  console.log(`  • Pricing tiers in DB: ${pricingResult.rows[0].count}`);
  console.log(`  • Process steps added: ${processCount}`);
  console.log(`  • Process steps in DB: ${processResult.rows[0].count}`);
  console.log(`  • Process section: 1 (metadata)`);
  console.log(`  • FAQ items added: ${faqCount}`);
  console.log(`  • FAQ items in DB: ${faqResult.rows[0].count}`);
  console.log(`  • FAQ section: 1 (metadata)`);

  console.log('\n✅ Migration completed successfully!');
}

// Run migration
seedCMSData().catch(console.error);
