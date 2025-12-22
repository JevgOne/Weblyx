import { turso } from '../lib/turso';

async function checkLeadDetails() {
  try {
    // Get today's lead with full details
    const result = await turso.execute({
      sql: `
        SELECT *
        FROM leads
        WHERE date(created_at, 'unixepoch', 'localtime') = date('now', 'localtime')
        ORDER BY created_at DESC
        LIMIT 1
      `,
      args: []
    });

    if (result.rows.length === 0) {
      console.log('❌ Žádná poptávka dnes.');
      return;
    }

    const lead = result.rows[0];

    console.log('\n📋 Kompletní detail dnešní poptávky:');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`ID: ${lead.id}`);
    console.log(`Status: ${lead.status}`);
    console.log(`Zdroj: ${lead.source}`);
    console.log('');
    console.log('👤 KONTAKTNÍ ÚDAJE:');
    console.log(`   Jméno: ${lead.name}`);
    console.log(`   Email: ${lead.email}`);
    console.log(`   Telefon: ${lead.phone || 'neuvedeno'}`);
    console.log('');
    console.log('🏢 FIRMA:');
    console.log(`   Název: ${lead.company}`);
    console.log(`   Popis: ${lead.business_description}`);
    console.log(`   Odvětví: ${lead.industry || 'neuvedeno'}`);
    console.log(`   Velikost: ${lead.company_size || 'neuvedeno'}`);
    console.log(`   IČO: ${lead.ico || 'neuvedeno'}`);
    console.log(`   Adresa: ${lead.address || 'neuvedeno'}`);
    console.log('');
    console.log('📊 PROJEKT:');
    console.log(`   Typ: ${lead.project_type}`);
    console.log(`   Cíl: ${lead.project_goal || 'neuvedeno'}`);
    console.log(`   Důvod: ${lead.project_reason || 'neuvedeno'}`);
    console.log(`   Rozpočet: ${lead.budget_range || 'neuvedeno'}`);
    console.log(`   Timeline: ${lead.timeline || 'neuvedeno'}`);
    console.log('');
    console.log('🌐 ONLINE:');
    console.log(`   Současný web: ${lead.existing_website || 'žádný'}`);
    console.log(`   Social media: ${lead.social_media || 'neuvedeno'}`);
    console.log('');
    console.log('📅 ČASOVÉ ÚDAJE:');
    console.log(`   Vytvořeno: ${new Date(Number(lead.created_at) * 1000).toLocaleString('cs-CZ')}`);
    console.log(`   Aktualizováno: ${new Date(Number(lead.updated_at) * 1000).toLocaleString('cs-CZ')}`);
    console.log('');
    console.log('💬 DALŠÍ INFO:');
    console.log(`   Odkud o nás ví: ${lead.how_did_you_hear || 'neuvedeno'}`);
    console.log(`   Preferovaný kontakt: ${lead.preferred_contact || 'neuvedeno'}`);
    console.log(`   Preferovaný čas: ${lead.preferred_meeting_time || 'neuvedeno'}`);
    console.log(`   Další požadavky: ${lead.additional_requirements || 'žádné'}`);
    console.log('');

  } catch (error) {
    console.error('❌ Chyba při načítání dat:', error);
    process.exit(1);
  }
}

checkLeadDetails();
