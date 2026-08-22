#!/usr/bin/env tsx
/**
 * Migration runner for the Turso database.
 *
 * Applies every migrations/*.sql file in alphabetical order, once. Applied
 * files are recorded in `_migrations`, so re-running is a no-op.
 *
 * The existing migrations were run by hand and duplicate each other in places
 * (`004_admin_sessions_and_ai_leads.sql` re-adds columns from `002`), so
 * "duplicate column name" is treated as already-applied rather than an error.
 *
 * Usage: npm run migrate
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { createClient } from '@libsql/client';

const MIGRATIONS_DIR = join(process.cwd(), 'migrations');

const url = process.env.TURSO_DATABASE_URL?.trim();
const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

if (!url || !authToken) {
  console.error('❌ TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set (.env.local).');
  process.exit(1);
}

const db = createClient({ url, authToken });

/** SQLite errors that mean "this statement was already applied". */
function isAlreadyApplied(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes('duplicate column name') ||
    m.includes('already exists')
  );
}

/**
 * Strips `--` line comments, leaving string literals alone. A `--` inside
 * '...' or "..." is data, not a comment (006 inserts texts with dashes).
 */
function stripComments(sql: string): string {
  let out = '';
  let quote: "'" | '"' | null = null;

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];

    if (quote) {
      out += char;
      if (char === quote) quote = null;
      continue;
    }

    if (char === "'" || char === '"') {
      quote = char;
      out += char;
      continue;
    }

    if (char === '-' && sql[i + 1] === '-') {
      const eol = sql.indexOf('\n', i);
      if (eol === -1) return out;
      i = eol - 1;
      continue;
    }

    out += char;
  }

  return out;
}

/**
 * Splits a file into statements. Comments are dropped first so a `;` inside a
 * comment cannot cut a statement in half, and so a trailing inline comment
 * after the last `;` does not become a comment-only "statement" (libSQL
 * rejects those with "SQLITE_OK: not an error").
 */
function splitStatements(sql: string): string[] {
  return stripComments(sql)
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
}

async function main() {
  await db.execute(
    'CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at INTEGER NOT NULL)'
  );

  const applied = new Set(
    (await db.execute('SELECT name FROM _migrations')).rows.map((r) => String(r.name))
  );

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  let ran = 0;

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`⏭  ${file} (already applied)`);
      continue;
    }

    const statements = splitStatements(readFileSync(join(MIGRATIONS_DIR, file), 'utf8'));
    console.log(`▶  ${file} — ${statements.length} statement(s)`);

    for (const statement of statements) {
      try {
        await db.execute(statement);
      } catch (error: any) {
        const message = error?.message || String(error);
        if (isAlreadyApplied(message)) {
          console.log(`   ↷ skipped (already applied): ${message}`);
          continue;
        }
        console.error(`❌ ${file} failed on:\n${statement}\n${message}`);
        process.exit(1);
      }
    }

    await db.execute({
      sql: 'INSERT INTO _migrations (name, applied_at) VALUES (?, unixepoch())',
      args: [file],
    });
    ran++;
    console.log(`✅ ${file}`);
  }

  console.log(ran === 0 ? '\nNic nového k aplikaci.' : `\nHotovo — aplikováno ${ran} migrací.`);
}

main().catch((error) => {
  console.error('❌ Migration runner failed:', error);
  process.exit(1);
});
