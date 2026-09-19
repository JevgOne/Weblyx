#!/usr/bin/env tsx
/**
 * Seeds the changelog with what has actually already happened on the site.
 *
 * The archive is a history, so it cannot start empty on a site that is two
 * years old — the section would say "nothing has been done here lately", which
 * is the opposite of the claim it exists to make. Every line below is a real
 * commit from this repository, its date taken from that commit, retitled in
 * the language a client reads. Nothing here is invented.
 *
 * Idempotent: re-running does not duplicate rows, so it is safe to call again
 * after a database restore.
 *
 * Usage: npm run seed:changelog
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL?.trim();
const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

if (!url || !authToken) {
  console.error('❌ TURSO_DATABASE_URL a TURSO_AUTH_TOKEN musí být nastavené (.env.local).');
  process.exit(1);
}

const db = createClient({ url, authToken });

interface Seed {
  date: string; // the commit's date
  type: 'content' | 'project' | 'system';
  title: string;
  detail?: string;
  isPublic: boolean;
}

const SEEDS: Seed[] = [
  {
    date: '2026-02-28',
    type: 'system',
    title: 'Měřicí kódy se načítají až po souhlasu s cookies',
    detail: 'Úprava podle GDPR — bez souhlasu se nespouští žádné marketingové skripty.',
    isPublic: true,
  },
  {
    date: '2026-03-01',
    type: 'system',
    title: 'Opravené chybové stránky a titulky pro vyhledávače',
    isPublic: true,
  },
  {
    date: '2026-03-17',
    type: 'content',
    title: 'Přestavěná homepage ze 17 sekcí na 11',
    detail: 'Kratší cesta od úvodu k poptávce.',
    isPublic: true,
  },
  {
    date: '2026-03-17',
    type: 'content',
    title: 'Vylepšené zobrazení webu na mobilech',
    isPublic: true,
  },
  {
    date: '2026-04-13',
    type: 'content',
    title: 'Přidány záruky, výzvy k akci a chat přes WhatsApp',
    isPublic: true,
  },
  {
    date: '2026-08-22',
    type: 'content',
    title: 'Kalkulačka ceny nahrazena konfigurátorem balíčků',
    detail: 'Vyberete balíček a doplňky a hned vidíte konečnou cenu.',
    isPublic: true,
  },
  {
    date: '2026-08-22',
    type: 'system',
    title: 'Poptávka nese celou konfiguraci z ceníku',
    detail: 'Balíček, doplňky, cena i odhad hodin platné v okamžiku odeslání.',
    isPublic: true,
  },
  {
    date: '2026-08-22',
    type: 'system',
    title: 'Opraveny tři chyby, které rozbíjely web v Safari',
    isPublic: true,
  },
  {
    date: '2026-08-23',
    type: 'system',
    title: 'Výpadek databáze už nestáhne celou stránku',
    detail: 'Nedostupná sekce se skryje, zbytek webu běží dál.',
    isPublic: true,
  },
  {
    date: '2026-08-23',
    type: 'content',
    title: 'Recenze, klienti a ukázky práce se načítají z administrace',
    detail: 'Co se změní v panelu, změní se i na webu — bez zásahu vývojáře.',
    isPublic: true,
  },
];

async function main() {
  // The table must exist; the migration runner owns its shape.
  const existing = new Set(
    (await db.execute('SELECT title FROM changelog')).rows.map((row) => String(row.title))
  );

  let inserted = 0;

  for (const seed of SEEDS) {
    if (existing.has(seed.title)) {
      console.log(`⏭  ${seed.title}`);
      continue;
    }

    await db.execute({
      sql: `INSERT INTO changelog (type, title, detail, author, is_public, created_at)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        seed.type,
        seed.title,
        seed.detail ?? null,
        'Weblyx',
        seed.isPublic ? 1 : 0,
        Math.floor(new Date(`${seed.date}T09:00:00Z`).getTime() / 1000),
      ],
    });

    inserted++;
    console.log(`✅ ${seed.title}`);
  }

  console.log(inserted === 0 ? '\nNic nového k vložení.' : `\nHotovo — vloženo ${inserted} záznamů.`);
}

main().catch((error) => {
  console.error('❌ Seed selhal:', error);
  process.exit(1);
});
