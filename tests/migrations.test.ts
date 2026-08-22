/**
 * Migration checks.
 *
 * The SQL files are asserted to be additive by reading them; the runner is
 * exercised against a throwaway local SQLite file seeded from turso-schema.sql.
 * Nothing here touches Turso — the test sets TURSO_DATABASE_URL to a file: URL
 * and dotenv does not override existing process env.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { readFileSync, readdirSync, mkdtempSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { spawnSync } from 'child_process';
import { createClient, type Client } from '@libsql/client';

const ROOT = join(__dirname, '..');
const MIGRATIONS = join(ROOT, 'migrations');

const NEW_MIGRATIONS = [
  '006_pricing_hours.sql',
  '007_lead_configuration.sql',
  '008_pricing_realignment.sql',
];

function statements(file: string): string[] {
  return readFileSync(join(MIGRATIONS, file), 'utf8')
    .split('\n')
    // drop `--` comments, leaving `--` inside string literals alone
    .map((l) => l.replace(/'[^']*'|"[^"]*"|--.*$/g, (m) => (m.startsWith('--') ? '' : m)))
    .join('\n')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
}

describe('new migrations are additive only', () => {
  for (const file of NEW_MIGRATIONS) {
    it(`${file} contains no destructive statement`, () => {
      for (const st of statements(file)) {
        const head = st.toUpperCase();
        expect(head, st).not.toMatch(/^DROP\b/);
        expect(head, st).not.toMatch(/\bALTER TABLE\b[\s\S]*\bDROP\b/);
        expect(head, st).not.toMatch(/\bRENAME\b/);
        expect(head, st).not.toMatch(/^DELETE\b/);
        expect(head, st).not.toMatch(/^TRUNCATE\b/);
      }
    });

    it(`${file} only uses ADD COLUMN / CREATE TABLE IF NOT EXISTS / INSERT / UPDATE`, () => {
      for (const st of statements(file)) {
        expect(
          /^(ALTER TABLE \S+ ADD COLUMN|CREATE TABLE IF NOT EXISTS|CREATE INDEX IF NOT EXISTS|INSERT( OR IGNORE)? INTO|UPDATE )/i.test(st),
          `unexpected statement: ${st}`
        ).toBe(true);
      }
    });
  }

  it('006 keeps price = hours x 500 with no charm ending', () => {
    const sql = readFileSync(join(MIGRATIONS, '006_pricing_hours.sql'), 'utf8');
    const rows = [...sql.matchAll(/SET hours = (\d+)[\s\S]*?price = (\d+) WHERE id = '(tier-\d)'/g)];
    expect(rows).toHaveLength(3);
    for (const [, hours, price] of rows) {
      expect(Number(price)).toBe(Number(hours) * 500);
      expect(Number(price) % 1000).toBe(0);
    }
  });

  it('008 restores the live prices and gives the packages a real gap', () => {
    const sql = readFileSync(join(MIGRATIONS, '008_pricing_realignment.sql'), 'utf8');
    const prices = [...sql.matchAll(/SET price = (\d+)[\s\S]*?WHERE id = '(tier-\d)'/g)]
      .map(([, price]) => Number(price));
    expect(prices).toEqual([7990, 14900, 29900]);
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i] / prices[i - 1]).toBeGreaterThan(1.5);
    }
  });

  it('008 scopes every add-on it prices to at least one tier', () => {
    const sql = readFileSync(join(MIGRATIONS, '008_pricing_realignment.sql'), 'utf8');
    for (const [, id] of sql.matchAll(/UPDATE pricing_addons SET price[\s\S]*?WHERE id = '([\w-]+)'/g)) {
      const stmt = sql.slice(sql.indexOf(`available_tiers`, sql.indexOf(id) - 400));
      expect(sql, id).toMatch(new RegExp(`available_tiers = '[^']+'[\\s\\S]*?WHERE id = '${id}'`));
      void stmt;
    }
  });

  it('007 adds exactly one nullable column to leads', () => {
    const sts = statements('007_lead_configuration.sql');
    expect(sts).toEqual(['ALTER TABLE leads ADD COLUMN configuration TEXT']);
  });
});

describe('scripts/migrate.ts against a local SQLite copy', () => {
  let dir: string;
  let dbPath: string;
  let db: Client;

  /** Runs the real runner against a local file DB. Returns {code, out}. */
  const run = (path: string = dbPath): { code: number; out: string } => {
    const res = spawnSync('npx', ['tsx', 'scripts/migrate.ts'], {
      cwd: ROOT,
      env: {
        ...process.env,
        TURSO_DATABASE_URL: `file:${path}`,
        TURSO_AUTH_TOKEN: 'local-test-token',
      },
      encoding: 'utf8',
    });
    return { code: res.status ?? -1, out: `${res.stdout}\n${res.stderr}` };
  };

  /** Seeds a fresh file DB with the committed production schema + pricing rows. */
  const seed = async (client: Client) => {
    const schema = readFileSync(join(ROOT, 'turso-schema.sql'), 'utf8')
      .split('\n')
      .filter((l) => !l.trim().startsWith('--'))
      .join('\n')
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean);
    for (const st of schema) await client.execute(st);

    /**
     * turso-schema.sql is stale: production's pricing_tiers also has
     * interval / cta_text / cta_link (verified with PRAGMA table_info against
     * Turso, read-only). Migration 006 and lib/turso/cms.ts both rely on
     * `interval`, so the local copy needs them to be representative.
     */
    for (const col of ['interval TEXT', 'cta_text TEXT', 'cta_link TEXT']) {
      await client.execute(`ALTER TABLE pricing_tiers ADD COLUMN ${col}`);
    }
    await client.execute(
      "INSERT INTO pricing_tiers (id, name, price, \"order\", active, interval) VALUES " +
        "('tier-1','Landing Page',7990,1,1,'month'),('tier-2','Základní Web',9990,2,1,'month'),('tier-3','Standardní Web',24990,3,1,'month')"
    );
  };

  /**
   * Reproduces production: 002-005 were applied by hand (so their columns
   * exist) and then recorded, leaving only 006/007 for the runner.
   */
  const markLegacyApplied = async () => {
    await db.execute(
      'CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at INTEGER NOT NULL)'
    );
    for (const f of readdirSync(MIGRATIONS)
      .filter((f) => f.endsWith('.sql') && !NEW_MIGRATIONS.includes(f))
      .sort()) {
      for (const st of statements(f)) {
        try {
          await db.execute(st);
        } catch (e: any) {
          if (!/duplicate column name|already exists/i.test(e?.message || '')) throw e;
        }
      }
      await db.execute({
        sql: 'INSERT OR IGNORE INTO _migrations (name, applied_at) VALUES (?, unixepoch())',
        args: [f],
      });
    }
  };

  beforeAll(async () => {
    dir = mkdtempSync(join(tmpdir(), 'weblyx-migrate-'));
    dbPath = join(dir, 'test.db');
    db = createClient({ url: `file:${dbPath}` });
    await seed(db);
  }, 60_000);

  afterAll(() => {
    db?.close();
    rmSync(dir, { recursive: true, force: true });
  });

  /**
   * REGRESSION (scripts/migrate.ts): splitStatements used to drop only
   * whole-line comments. A trailing `-- comment` after the LAST `;` in a file
   * became a comment-only "statement"; libsql rejects those with
   * "SQLITE_OK: not an error", which isAlreadyApplied does not recognise, so
   * the runner exited(1). 004_admin_sessions_and_ai_leads.sql:33 ends exactly
   * like that, so on a database where _migrations is still empty (i.e.
   * production, where 002-005 were applied by hand) `npm run migrate` died
   * before reaching 005/006/007.
   *
   * Runs on its own throwaway DB so the suite's shared copy keeps starting
   * from "legacy files applied by hand".
   */
  it('REGRESSION: applies 002-007 from an empty _migrations table (trailing inline comment)', async () => {
    const virginPath = join(dir, 'virgin.db');
    const virgin = createClient({ url: `file:${virginPath}` });
    await seed(virgin);

    const { code, out } = run(virginPath);
    expect(out).not.toContain('SQLITE_OK: not an error');
    expect(out).not.toContain('failed on');
    expect(code).toBe(0);
    expect(out).toContain('✅ 004_admin_sessions_and_ai_leads.sql');

    const applied = (await virgin.execute('SELECT name FROM _migrations')).rows.map((r) =>
      String(r.name)
    );
    expect(applied).toEqual(
      expect.arrayContaining(readdirSync(MIGRATIONS).filter((f) => f.endsWith('.sql')))
    );
    virgin.close();
  }, 120_000);

  it('applies 006 + 007 once the legacy files are marked as applied', async () => {
    await markLegacyApplied();
    const { code, out } = run();
    expect(code).toBe(0);
    expect(out).toContain('✅ 006_pricing_hours.sql');
    expect(out).toContain('✅ 007_lead_configuration.sql');

    const applied = (await db.execute('SELECT name FROM _migrations ORDER BY name')).rows.map(
      (r) => String(r.name)
    );
    expect(applied).toEqual(readdirSync(MIGRATIONS).filter((f) => f.endsWith('.sql')).sort());
  }, 120_000);

  it('is idempotent — a second run applies nothing', async () => {
    const { code, out } = run();
    expect(code).toBe(0);
    expect(out).toContain('Nic nového k aplikaci.');
    expect(out).toContain('(already applied)');
  }, 120_000);

  it('survives re-running 006 when its columns already exist (duplicate column name)', async () => {
    await db.execute("DELETE FROM _migrations WHERE name = '006_pricing_hours.sql'");
    const { code, out } = run();
    expect(code).toBe(0);
    expect(out).toContain('duplicate column name');
    expect(out).toContain('✅ 006_pricing_hours.sql');
  }, 120_000);

  it('survives re-running 007 when leads.configuration already exists', async () => {
    await db.execute("DELETE FROM _migrations WHERE name = '007_lead_configuration.sql'");
    const { code, out } = run();
    expect(code).toBe(0);
    expect(out).toContain('✅ 007_lead_configuration.sql');
  }, 120_000);

  it('006 produced the pricing columns, add-ons and hourly rate', async () => {
    const cols = (await db.execute('PRAGMA table_info(pricing_tiers)')).rows.map((r) =>
      String(r.name)
    );
    expect(cols).toEqual(expect.arrayContaining(['hours', 'delivery_days', 'short_desc']));

    const addons = (await db.execute('SELECT id, hours FROM pricing_addons ORDER BY "order"')).rows;
    expect(addons.map((r) => String(r.id))).toEqual([
      'addon-blog',
      'addon-booking',
      'addon-language',
      'addon-eshop',
      'addon-copywriting',
    ]);

    const rate = (await db.execute("SELECT value FROM settings WHERE key = 'hourly_rate'")).rows[0];
    expect(String(rate.value)).toBe('500');
  });

  it('006 backfilled the packages to hours x 500 and one-time billing', async () => {
    const rows = (
      await db.execute('SELECT id, hours, price, interval, delivery_days FROM pricing_tiers ORDER BY "order"')
    ).rows;
    expect(rows.map((r) => [String(r.id), Number(r.hours), Number(r.price)])).toEqual([
      ['tier-1', 16, 8000],
      ['tier-2', 20, 10000],
      ['tier-3', 50, 25000],
    ]);
    expect(rows.every((r) => String(r.interval) === 'one-time')).toBe(true);
    expect(rows.every((r) => String(r.delivery_days).length > 0)).toBe(true);
  });

  it('007 produced leads.configuration as a nullable TEXT column', async () => {
    const col = (await db.execute('PRAGMA table_info(leads)')).rows.find(
      (r) => String(r.name) === 'configuration'
    );
    expect(col).toBeDefined();
    expect(String(col!.type)).toBe('TEXT');
    expect(Number(col!.notnull)).toBe(0);
  });

  it('the exact INSERT from app/api/leads/route.ts executes against the migrated schema', async () => {
    const src = readFileSync(join(ROOT, 'app/api/leads/route.ts'), 'utf8');
    const sql = src.match(/(INSERT INTO leads \([\s\S]*?\) VALUES \([\s\S]*?\))\s*`/)![1];
    const placeholders = (sql.match(/\?/g) || []).length;
    const args = Array.from({ length: placeholders }, (_, i) => `v${i}`);
    // Fails loudly on a column/placeholder/arg mismatch or a wrong column name.
    await db.execute({ sql, args });

    // Every column must receive the arg at the same position — a shifted list
    // would silently write values into the wrong columns.
    const columns = sql
      .match(/INSERT INTO leads \(([\s\S]*?)\)\s*VALUES/)![1]
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c !== 'created_at' && c !== 'updated_at');
    expect(columns).toHaveLength(placeholders);

    const row = (await db.execute('SELECT * FROM leads WHERE id = ?', ['v0'])).rows[0] as any;
    columns.forEach((col, i) => {
      expect(String(row[col]), `column ${col} (position ${i + 1})`).toBe(`v${i}`);
    });
    expect(Number(row.created_at)).toBeGreaterThan(1_700_000_000);
    expect(Number(row.updated_at)).toBeGreaterThan(1_700_000_000);

    await db.execute("DELETE FROM leads WHERE id = 'v0'");
  });
});
