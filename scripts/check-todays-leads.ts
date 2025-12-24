import { turso } from '../lib/turso';

async function checkTodaysLeads() {
  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Query for today's leads
    const result = await turso.execute({
      sql: `
        SELECT
          COUNT(*) as total,
          name,
          email,
          company,
          project_type,
          datetime(created_at, 'unixepoch', 'localtime') as created_time
        FROM leads
        WHERE date(created_at, 'unixepoch', 'localtime') = date('now', 'localtime')
        ORDER BY created_at DESC
      `,
      args: []
    });

    console.log('\n📊 Dnešní poptávky (' + today + '):');
    console.log('═══════════════════════════════════════════════════════');

    if (result.rows.length === 0) {
      console.log('❌ Žádné poptávky dnes.');
    } else {
      console.log(`✅ Celkem poptávek: ${result.rows.length}\n`);

      result.rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.name} (${row.email})`);
        console.log(`   Firma: ${row.company}`);
        console.log(`   Typ: ${row.project_type}`);
        console.log(`   Čas: ${row.created_time}`);
        console.log('');
      });
    }

    // Also count all leads
    const totalResult = await turso.execute({
      sql: 'SELECT COUNT(*) as total FROM leads',
      args: []
    });

    console.log(`📈 Celkem poptávek v databázi: ${totalResult.rows[0].total}`);

  } catch (error) {
    console.error('❌ Chyba při načítání dat:', error);
    process.exit(1);
  }
}

checkTodaysLeads();
