import { executeQuery } from '../lib/turso';

async function seedHeroData() {
  try {
    console.log('Seeding hero section data...');

    const now = Math.floor(Date.now() / 1000);

    await executeQuery(
      `INSERT INTO homepage_sections (id, hero_title, hero_subtitle, hero_cta_text, hero_cta_link, hero_image, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         hero_title = excluded.hero_title,
         hero_subtitle = excluded.hero_subtitle,
         hero_cta_text = excluded.hero_cta_text,
         hero_cta_link = excluded.hero_cta_link,
         updated_at = excluded.updated_at`,
      [
        'current',
        'Tvorba webových stránek za týden',
        'Rychlá tvorba webových stránek na <strong>Next.js místo WordPressu</strong>. Web do týdne (<strong>5–7 dní</strong>), nejrychlejší načítání <strong>pod 2 sekundy</strong>. Levné webové stránky pro živnostníky a firmy.',
        'Nezávazná konzultace zdarma',
        '/poptavka',
        '', // Empty image URL - will be uploaded via admin panel
        now,
      ]
    );

    console.log('✓ Hero section data seeded successfully!');
  } catch (error) {
    console.error('Error seeding hero data:', error);
    throw error;
  }
}

seedHeroData()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
