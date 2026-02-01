/**
 * Fix remaining services and portfolio items that were missed in the first pass
 */
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '..', '.env.local') });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function fixRemainingServices() {
  console.log('\n📋 Fixing remaining services...');

  // Fix "Premium E-shop" (was "Prémiový E-shop" in first script key)
  await db.execute({
    sql: `UPDATE services SET title_de = ?, description_de = ?, features_de = ? WHERE title = ?`,
    args: [
      'Premium-Onlineshop',
      'Vollständiger Online-Shop mit unbegrenzten Produkten, mehreren Zahlungsgateways und Premium-Support.',
      JSON.stringify([
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
      ]),
      'Premium E-shop',
    ],
  });
  console.log('  ✅ Fixed Premium E-shop → Premium-Onlineshop');

  // Fix older services (not pricing packages but shown elsewhere)
  const olderServices: Record<string, { title_de: string; description_de: string; features_de: string[] }> = {
    'Webové stránky': {
      title_de: 'Websites',
      description_de: 'Moderne, responsive Websites zum Festpreis – von der Freelancer-Homepage bis zur Unternehmenswebsite.',
      features_de: [
        'Responsives Design (Mobil, Tablet, Desktop)',
        'Modernes und sauberes Design',
        'Grundlegende SEO-Optimierung',
        'Kontaktformular',
        'Google Analytics Integration',
        'Schnelle Ladezeit (< 2s)',
        '1 Monat Support inklusive',
        'Schulung zur Website-Verwaltung',
      ],
    },
    'SEO optimalizace': {
      title_de: 'SEO-Optimierung',
      description_de: 'Erreichen Sie Top-Positionen in Suchmaschinen mit unserer umfassenden SEO-Strategie.',
      features_de: [
        'Keyword-Recherche',
        'On-Page-Optimierung',
        'Technisches SEO (Geschwindigkeit, Core Web Vitals)',
        'Content-Optimierung',
        'Meta-Tags und Structured Data',
        'Linkbuilding',
        'Monatliche Berichte und Analytics',
        'Wettbewerbsanalyse',
      ],
    },
    'E-shopy': {
      title_de: 'Online-Shops',
      description_de: 'Komplette E-Commerce-Lösungen mit Produktkatalog, Zahlungsabwicklung und Bestellverwaltung.',
      features_de: [
        'Produktkatalog mit Varianten',
        'Warenkorb und Checkout',
        'Zahlungsgateways (GoPay, Stripe, PayPal)',
        'Versand (DHL, DPD, Hermes)',
        'Admin-Panel zur Verwaltung',
        'Lager- und Bestellverwaltung',
        'E-Mail-Benachrichtigungen',
        'SEO-Optimierung für Produkte',
        '6 Monate Support inklusive',
      ],
    },
    'Redesign': {
      title_de: 'Website-Redesign',
      description_de: 'Modernisierung veralteter Websites mit neuem Design, verbesserter UX und höherer Geschwindigkeit.',
      features_de: [
        'Analyse der bestehenden Website',
        'Neues modernes Design',
        'Verbesserung von UX/UI',
        'Optimierung für mobile Geräte',
        'Content-Migration',
        'SEO-Weiterleitungen',
        'Verbesserte Ladegeschwindigkeit',
        '3 Monate Support inklusive',
      ],
    },
    'Rychlost načítání': {
      title_de: 'Geschwindigkeitsoptimierung',
      description_de: 'Schnellere Ladezeiten für besseres SEO und optimale Benutzererfahrung.',
      features_de: [
        'Performance-Audit',
        'Bildoptimierung',
        'CSS/JS-Minifizierung',
        'Lazy Loading',
        'Caching-Strategie',
        'CDN-Implementierung',
        'Core Web Vitals Optimierung',
        'Lighthouse Score > 90',
      ],
    },
    'Údržba a podpora': {
      title_de: 'Wartung und Support',
      description_de: 'Regelmäßige Updates, Backups und technischer Support für eine sichere und funktionsfähige Website.',
      features_de: [
        'Regelmäßige System-Updates',
        'Sicherheits-Backups',
        'Performance- und Verfügbarkeitsmonitoring',
        'Technischer Support (E-Mail, Telefon)',
        'Kleine Inhaltsänderungen',
        'Fehlerbehebung',
        'Monatliche Berichte',
        'Prioritäre Reaktion auf Probleme',
      ],
    },
  };

  for (const [czechTitle, trans] of Object.entries(olderServices)) {
    const result = await db.execute({
      sql: `UPDATE services SET title_de = ?, description_de = ?, features_de = ? WHERE title = ?`,
      args: [trans.title_de, trans.description_de, JSON.stringify(trans.features_de), czechTitle],
    });
    if (result.rowsAffected > 0) {
      console.log(`  ✅ Fixed "${czechTitle}" → "${trans.title_de}"`);
    } else {
      console.log(`  ⚠️  No service found with title: "${czechTitle}"`);
    }
  }
}

async function fixPortfolioDescriptions() {
  console.log('\n📋 Fixing portfolio descriptions with proper translations...');

  // Read all portfolio items to see actual titles and descriptions
  const portfolio = await db.execute('SELECT id, title, description FROM portfolio ORDER BY "order" ASC');

  for (const row of portfolio.rows) {
    const title = row.title as string;
    const desc = row.description as string;
    console.log(`  Portfolio: "${title}"`);
    console.log(`    CZ desc: "${desc}"`);

    // Create proper German descriptions based on the actual Czech descriptions
    let germanDesc: string;
    let germanTitle: string | null = null;

    if (title.includes('Titan Gym') || title.includes('Titan Boxing')) {
      germanTitle = 'Titan Gym – Website für Boxclub mit Online-Buchung';
      germanDesc = 'Moderne Website für einen Boxclub mit Online-Buchungssystem, Trainingsplan und Mitgliederverwaltung. Entwickelt mit Next.js für maximale Performance.';
    } else if (title.includes('MŮZA') || title.includes('Muza')) {
      germanTitle = 'MŮZA Hair – Online-Shop für Haarverlängerungen';
      germanDesc = 'E-Commerce-Shop für den Verkauf von Haarverlängerungen mit Produktkatalog, Warenkorb und sicherer Zahlungsabwicklung.';
    } else if (title.includes('CarMakléř') || title.includes('Car')) {
      germanTitle = 'CarMakléř – Portal für Fahrzeugverkauf + CRM + Mobile App';
      germanDesc = 'Fahrzeugverkaufsportal mit CRM-System, mobiler App und automatisierter Kundenkommunikation. Komplexe Plattform mit mehreren Benutzerrollen.';
    } else if (title.includes('FitCoach')) {
      germanTitle = 'FitCoach – Website für Fitness-Trainer und gesunden Lebensstil';
      germanDesc = 'Persönliche Website für einen Fitness-Trainer mit Trainingsplan, Online-Buchung und Blog über gesunde Ernährung und Lebensstil.';
    } else if (title.includes('ProdavameSRO') || title.includes('Prodavame')) {
      germanTitle = 'ProdavameSRO – Katalog für schlüsselfertige Unternehmen';
      germanDesc = 'Online-Katalog für den Verkauf von schlüsselfertigen Unternehmen (GmbH) mit Filterung, Detailseiten und Kontaktformular.';
    } else if (title.includes('VykupujemeSRO') || title.includes('Vykupujeme')) {
      germanTitle = 'VykupujemeSRO – Schneller Ankauf von Unternehmen';
      germanDesc = 'Webplattform für den schnellen Ankauf von Unternehmen mit automatisierter Bewertung und Kontaktformular.';
    } else {
      germanDesc = `Professionelle Website für ${title} – entwickelt mit modernen Technologien für optimale Performance und Benutzererfahrung.`;
    }

    const updates: string[] = ['description_de = ?'];
    const args: any[] = [germanDesc];
    
    if (germanTitle) {
      updates.push('title_de = ?');
      args.push(germanTitle);
    }
    
    args.push(row.id as string);

    await db.execute({
      sql: `UPDATE portfolio SET ${updates.join(', ')} WHERE id = ?`,
      args,
    });
    console.log(`  ✅ Updated: "${germanTitle || title}" → "${germanDesc.substring(0, 60)}..."`);
  }
}

async function verifyAll() {
  console.log('\n📋 Verifying all German content...\n');

  // Check process section
  const ps = await db.execute("SELECT title_de, subtitle_de FROM process_section WHERE id = 'current'");
  console.log('Process Section:');
  console.log(`  title_de: ${ps.rows[0]?.title_de}`);
  console.log(`  subtitle_de: ${ps.rows[0]?.subtitle_de}`);

  // Check process steps
  const steps = await db.execute('SELECT title, title_de, description_de FROM process_steps ORDER BY "order" ASC');
  console.log('\nProcess Steps:');
  for (const row of steps.rows) {
    console.log(`  ${row.title} → ${row.title_de} | ${(row.description_de as string)?.substring(0, 50)}...`);
  }

  // Check services
  const services = await db.execute('SELECT title, title_de, description_de, features_de FROM services ORDER BY "order" ASC');
  console.log('\nServices:');
  for (const row of services.rows) {
    const featureCount = row.features_de ? JSON.parse(row.features_de as string).length : 0;
    console.log(`  ${row.title} → ${row.title_de || '❌ MISSING'} | features_de: ${featureCount} items | desc_de: ${row.description_de ? '✅' : '❌'}`);
  }

  // Check portfolio
  const portfolio = await db.execute('SELECT title, title_de, description_de FROM portfolio ORDER BY "order" ASC');
  console.log('\nPortfolio:');
  for (const row of portfolio.rows) {
    console.log(`  ${row.title} → ${row.title_de || '(same)'} | desc_de: ${row.description_de ? '✅' : '❌'}`);
  }
}

async function main() {
  console.log('🇩🇪 Fixing remaining German content...\n');

  await fixRemainingServices();
  await fixPortfolioDescriptions();
  await verifyAll();

  console.log('\n\n🎉 All fixes applied!');
}

main();
