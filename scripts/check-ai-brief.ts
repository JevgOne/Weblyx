import { turso } from '../lib/turso';

async function checkAIBrief() {
  try {
    const result = await turso.execute({
      sql: `
        SELECT name, company, ai_brief, brief_generated_at
        FROM leads
        WHERE name LIKE '%Daniel%' OR company LIKE '%Exchange%'
        LIMIT 1
      `,
      args: []
    });

    if (result.rows.length === 0) {
      console.log('❌ Lead not found');
      return;
    }

    const lead = result.rows[0];
    console.log('\n📋 Lead:', lead.name, '-', lead.company);
    console.log('\n🤖 AI Brief:');
    console.log(lead.ai_brief);
    console.log('\n📅 Generated At:', lead.brief_generated_at);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAIBrief();
