/**
 * Fix ALL remaining Czech content for seitelyx.de (German version)
 * 
 * This script:
 * 1. Adds German columns to process_section, process_steps, services, portfolio tables
 * 2. Populates German translations for all DB content
 * 3. Does NOT modify Czech content
 */

import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load env from project root
dotenv.config({ path: resolve(__dirname, '..', '.env.local') });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function columnExists(table: string, column: string): Promise<boolean> {
  try {
    const result = await db.execute(`PRAGMA table_info(${table})`);
    return result.rows.some((row: any) => row.name === column);
  } catch (e) {
    console.error(`Error checking column ${column} in ${table}:`, e);
    return false;
  }
}

async function addColumnIfNotExists(table: string, column: string, type: string = 'TEXT') {
  const exists = await columnExists(table, column);
  if (!exists) {
    console.log(`  Adding column ${column} to ${table}...`);
    await db.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
    console.log(`  ✅ Added ${column} to ${table}`);
  } else {
    console.log(`  ℹ️  Column ${column} already exists in ${table}`);
  }
}

// ============================================================
// 1. PROCESS SECTION & STEPS - German translations
// ============================================================
async function fixProcessSection() {
  console.log('\n📋 1. Fixing Process Section...');

  // Add German columns
  await addColumnIfNotExists('process_section', 'title_de');
  await addColumnIfNotExists('process_section', 'subtitle_de');

  // Update German content for process section
  const result = await db.execute("SELECT * FROM process_section WHERE id = 'current'");
  if (result.rows.length > 0) {
    await db.execute({
      sql: `UPDATE process_section SET title_de = ?, subtitle_de = ? WHERE id = 'current'`,
      args: [
        'So funktioniert es',
        'Unser Prozess ist einfach, transparent und effizient',
      ],
    });
    console.log('  ✅ Updated process_section with German translations');
  } else {
    console.log('  ⚠️  No process_section row found with id=current');
  }
}

async function fixProcessSteps() {
  console.log('\n📋 2. Fixing Process Steps...');

  // Add German columns
  await addColumnIfNotExists('process_steps', 'title_de');
  await addColumnIfNotExists('process_steps', 'description_de');

  // Read existing steps
  const steps = await db.execute('SELECT id, title, description, "order" FROM process_steps ORDER BY "order" ASC');
  console.log(`  Found ${steps.rows.length} process steps`);

  // German translations mapped by Czech title
  const translations: Record<string, { title_de: string; description_de: string }> = {
    'Konzultace': {
      title_de: 'Beratung',
      description_de: 'Kostenlose unverbindliche Beratung, bei der wir Ihre Anforderungen und Ziele besprechen.',
    },
    'Návrh designu': {
      title_de: 'Design-Entwurf',
      description_de: 'Wir erstellen einen Design-Entwurf, der zu Ihrer Marke und Ihren Zielen passt.',
    },
    'Vývoj': {
      title_de: 'Entwicklung',
      description_de: 'Wir entwickeln eine moderne Website mit Fokus auf Geschwindigkeit und Benutzererfahrung.',
    },
    'Testování': {
      title_de: 'Testing',
      description_de: 'Gründliche Tests auf allen Geräten und Browsern.',
    },
    'Spuštění': {
      title_de: 'Launch',
      description_de: 'Wir bringen die Website live und sorgen für einen reibungslosen Start.',
    },
    'Podpora': {
      title_de: 'Support',
      description_de: 'Wir bieten technischen Support und helfen bei der Weiterentwicklung.',
    },
  };

  for (const row of steps.rows) {
    const czechTitle = row.title as string;
    const trans = translations[czechTitle];
    if (trans) {
      await db.execute({
        sql: `UPDATE process_steps SET title_de = ?, description_de = ? WHERE id = ?`,
        args: [trans.title_de, trans.description_de, row.id as string],
      });
      console.log(`  ✅ Updated step "${czechTitle}" → "${trans.title_de}"`);
    } else {
      console.log(`  ⚠️  No translation found for step: "${czechTitle}" (id: ${row.id})`);
    }
  }
}

// ============================================================
// 2. SERVICE FEATURES - German translations
// ============================================================
async function fixServiceFeatures() {
  console.log('\n📋 3. Fixing Service Features...');

  // Add German columns
  await addColumnIfNotExists('services', 'features_de');
  await addColumnIfNotExists('services', 'title_de');
  await addColumnIfNotExists('services', 'description_de');

  // Read existing services
  const services = await db.execute('SELECT id, title, description, features FROM services ORDER BY "order" ASC');
  console.log(`  Found ${services.rows.length} services`);

  for (const row of services.rows) {
    console.log(`  Service: "${row.title}" (id: ${row.id})`);
    const features = row.features ? JSON.parse(row.features as string) : [];
    console.log(`    Features (CZ): ${JSON.stringify(features)}`);
  }

  // German features mapped by Czech title patterns
  const featureTranslations: Record<string, { title_de: string; description_de: string; features_de: string[] }> = {
    'Landing Page': {
      title_de: 'Landing Page',
      description_de: 'Perfekt für eine einfache Präsentation oder Kampagne. Eine Seite mit mehreren Abschnitten.',
      features_de: [
        '1 Seite, 3-5 Abschnitte',
        'Responsives Design',
        'Kontaktformular',
        'SEO-Grundlagen',
        'Google Analytics',
        'Lieferung in 3-5 Tagen',
        '1 Monat Support',
      ],
    },
    'Základní Web': {
      title_de: 'Basis-Website',
      description_de: 'Professionelle Website für Freelancer und kleine Unternehmen mit mehreren Unterseiten.',
      features_de: [
        'Kontaktformular',
        '3-5 Unterseiten',
        'Modernes Design',
        'Erweitertes SEO',
        'Blog mit CMS-Editor',
        'Social-Media-Anbindung',
        'Lieferung in 5-7 Tagen',
        '2 Monate Support',
      ],
    },
    'Standardní Web': {
      title_de: 'Standard-Website',
      description_de: 'Umfangreiche Website mit Premium-Design, CMS und erweiterten Funktionen.',
      features_de: [
        '10+ Unterseiten',
        'Premium-Design nach Maß',
        'Erweiterte Animationen',
        'Komplettes CMS für Content-Verwaltung',
        'Buchungssystem',
        'Newsletter-Integration',
        'Erweitertes SEO und Analytics',
        'Lieferung in 7-10 Tagen',
        '3 Monate Support',
        '2h Anpassungen gratis',
      ],
    },
    'Mini E-shop': {
      title_de: 'Mini-Onlineshop',
      description_de: 'Kompakter Online-Shop für bis zu 50 Produkte mit allen wichtigen E-Commerce-Funktionen.',
      features_de: [
        'Bis zu 50 Produkte',
        'Zahlungsgateway (Stripe, GoPay)',
        'Bestellverwaltung',
        'Kategorien und Filter',
        'Wunschliste, Warenkorb, Checkout',
        'E-Mail-Benachrichtigungen',
        'SEO-Optimierung',
        'Lieferung in 14 Tagen',
        '6 Monate Support',
      ],
    },
    'Prémiový E-shop': {
      title_de: 'Premium-Onlineshop',
      description_de: 'Vollständiger Online-Shop mit unbegrenzten Produkten, mehreren Zahlungsgateways und Premium-Support.',
      features_de: [
        'Unbegrenzte Produktanzahl',
        'Mehrere Zahlungsgateways',
        'Versanddienstleister-Anbindung',
        'Erweiterte Filter und Suche',
        'Benutzerkonten',
        'Gutscheine und Rabatte',
        'Produktbewertungen',
        'Mehrsprachig',
        'Buchhaltungs-Anbindung',
        'Lieferung in 21-28 Tagen',
        '12 Monate Premium-Support',
      ],
    },
  };

  for (const row of services.rows) {
    const czechTitle = row.title as string;
    const trans = featureTranslations[czechTitle];
    if (trans) {
      await db.execute({
        sql: `UPDATE services SET title_de = ?, description_de = ?, features_de = ? WHERE id = ?`,
        args: [trans.title_de, trans.description_de, JSON.stringify(trans.features_de), row.id as string],
      });
      console.log(`  ✅ Updated service "${czechTitle}" → "${trans.title_de}" with ${trans.features_de.length} German features`);
    } else {
      console.log(`  ⚠️  No translation found for service: "${czechTitle}" (id: ${row.id})`);
    }
  }
}

// ============================================================
// 3. PORTFOLIO - German descriptions
// ============================================================
async function fixPortfolioDescriptions() {
  console.log('\n📋 4. Fixing Portfolio Descriptions...');

  // Add German columns
  await addColumnIfNotExists('portfolio', 'description_de');
  await addColumnIfNotExists('portfolio', 'title_de');

  // Read existing portfolio items
  const portfolio = await db.execute('SELECT id, title, description FROM portfolio ORDER BY "order" ASC');
  console.log(`  Found ${portfolio.rows.length} portfolio items`);

  // Czech-to-German translations for portfolio descriptions
  const portfolioTranslations: Record<string, { title_de?: string; description_de: string }> = {
    'Titan Boxing': {
      description_de: 'Moderne Website für einen Boxclub mit Trainingsplan, Mitgliedschaft und Bildergalerie. Schnelle Ladezeit und mobiloptimiertes Design.',
    },
    'Altro Servis': {
      description_de: 'Unternehmenswebsite für ein Dienstleistungsunternehmen mit Leistungsübersicht, Team-Vorstellung und Kontaktformular.',
    },
    'Foxwood Burger': {
      description_de: 'Restaurant-Website mit Online-Speisekarte, Reservierungssystem und ansprechendem Food-Photography-Design.',
    },
    'Weblyx': {
      description_de: 'Eigene Agentur-Website mit Portfolio, Preiskalkulator und automatisiertem Lead-Management-System.',
    },
    'Seitelyx': {
      description_de: 'Deutsche Version unserer Agentur-Website mit lokalisiertem Content und DSGVO-konformem Design.',
    },
  };

  for (const row of portfolio.rows) {
    const title = row.title as string;
    const czechDesc = row.description as string;

    // Try to find by title match
    let trans = portfolioTranslations[title];
    
    if (!trans && czechDesc) {
      // Auto-generate a professional German translation based on Czech description
      // Map common Czech terms to German
      let germanDesc = czechDesc;
      const replacements: [RegExp, string][] = [
        [/Moderní webová stránka/gi, 'Moderne Website'],
        [/webová stránka/gi, 'Website'],
        [/webové stránky/gi, 'Websites'],
        [/tvorba webu/gi, 'Webentwicklung'],
        [/responzivní design/gi, 'Responsives Design'],
        [/rychlé načítání/gi, 'Schnelle Ladezeit'],
        [/kontaktní formulář/gi, 'Kontaktformular'],
        [/rezervační systém/gi, 'Reservierungssystem'],
        [/online objednávky/gi, 'Online-Bestellungen'],
        [/fotogalerie/gi, 'Bildergalerie'],
        [/jídelní lístek/gi, 'Speisekarte'],
        [/prezentace/gi, 'Präsentation'],
        [/služby/gi, 'Dienstleistungen'],
        [/portfolio/gi, 'Portfolio'],
        [/moderní/gi, 'modern'],
        [/profesionální/gi, 'professionell'],
        [/rychlý/gi, 'schnell'],
      ];

      for (const [pattern, replacement] of replacements) {
        germanDesc = germanDesc.replace(pattern, replacement);
      }

      // If it's still mostly Czech, create a generic German description
      if (/[čřžšďťňůáíéýó]/i.test(germanDesc)) {
        germanDesc = `Professionelle Website für ${title} – entwickelt mit modernen Technologien für optimale Performance und Benutzererfahrung.`;
      }

      trans = { description_de: germanDesc };
    }

    if (trans) {
      const updates: string[] = ['description_de = ?'];
      const args: any[] = [trans.description_de];
      
      if (trans.title_de) {
        updates.push('title_de = ?');
        args.push(trans.title_de);
      }
      
      args.push(row.id as string);
      
      await db.execute({
        sql: `UPDATE portfolio SET ${updates.join(', ')} WHERE id = ?`,
        args,
      });
      console.log(`  ✅ Updated portfolio "${title}" with German description`);
    } else {
      console.log(`  ⚠️  No translation and no Czech description for: "${title}"`);
    }
  }
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log('🇩🇪 Fixing seitelyx.de German content...\n');
  console.log('Database:', process.env.TURSO_DATABASE_URL);

  try {
    // Test connection
    const test = await db.execute('SELECT 1');
    console.log('✅ Database connection successful');

    await fixProcessSection();
    await fixProcessSteps();
    await fixServiceFeatures();
    await fixPortfolioDescriptions();

    console.log('\n\n🎉 All database updates completed successfully!');
    console.log('\nNext steps:');
    console.log('  - Fix hardcoded Czech strings in components (done separately)');
    console.log('  - Verify on seitelyx.de that all content is now German');
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();
