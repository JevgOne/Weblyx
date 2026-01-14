import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env.local') });

import { turso } from '../lib/turso';

async function checkNotes() {
  try {
    console.log('🔍 Kontroluji poznámky v EroWeb analýzách...\n');

    const result = await turso.execute({
      sql: `SELECT
        id,
        domain,
        notes,
        datetime(created_at, 'unixepoch') as created,
        datetime(updated_at, 'unixepoch') as updated
      FROM eroweb_analyses
      ORDER BY created_at DESC
      LIMIT 20`,
      args: [],
    });

    if (result.rows.length === 0) {
      console.log('❌ Žádné analýzy nenalezeny');
      return;
    }

    console.log(`✅ Nalezeno ${result.rows.length} analýz\n`);

    for (const row of result.rows) {
      console.log('─'.repeat(80));
      console.log(`📊 Domain: ${row.domain}`);
      console.log(`🆔 ID: ${row.id}`);
      console.log(`📅 Vytvořeno: ${row.created}`);
      console.log(`🔄 Aktualizováno: ${row.updated}`);

      if (row.notes) {
        console.log(`📝 POZNÁMKY:\n${row.notes}`);
      } else {
        console.log('📝 Poznámky: (žádné)');
      }
      console.log('');
    }

    console.log('─'.repeat(80));

    // Kolik má notes vyplněné
    const withNotes = result.rows.filter(r => r.notes && r.notes.toString().trim() !== '');
    console.log(`\n📊 Statistika: ${withNotes.length}/${result.rows.length} má vyplněné poznámky`);

  } catch (error: any) {
    console.error('❌ Chyba při načítání poznámek:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

checkNotes();
