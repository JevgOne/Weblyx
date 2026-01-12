// Script to fix old recommendation texts in database
// Updates all analyses that still have old package/pricing mentions

import { getAllAnalyses } from '../lib/turso/eroweb';
import { executeQuery } from '../lib/turso';

async function fixOldRecommendations() {
  console.log('🔍 Checking for analyses with old recommendation text...');

  const { analyses } = await getAllAnalyses({ limit: 1000 });

  let fixed = 0;
  let total = 0;

  for (const analysis of analyses) {
    if (!analysis.recommendation) continue;

    const recommendation = analysis.recommendation;

    // Check if contains old text patterns
    const hasOldText =
      recommendation.includes('balíček') ||
      recommendation.includes('balíek') ||
      recommendation.includes('PREMIUM') ||
      recommendation.includes('BASIC') ||
      recommendation.includes('ENTERPRISE') ||
      recommendation.includes('49 990') ||
      recommendation.includes('59 990') ||
      recommendation.includes('29 990');

    if (hasOldText) {
      total++;
      console.log(`\n❌ Found old text in ${analysis.domain}`);
      console.log(`   Old: ${recommendation.slice(0, 150)}...`);

      // Create new recommendation without package mention
      const lines = recommendation.split('\n');
      const firstLines = lines.slice(0, 2); // Keep first 2 lines (general assessment and weak areas)

      const businessTypeLabels: Record<string, string> = {
        massage: 'erotické masáže',
        privat: 'privátní služby',
        escort: 'escort služby',
      };

      const businessLabel = businessTypeLabels[analysis.businessType] || analysis.businessType;

      const newRecommendation = [
        ...firstLines,
        '',
        `Ceník je individuální podle rozsahu prací. Pro váš typ podnikání (${businessLabel}) připravíme nabídku přesně na míru.`
      ].join('\n');

      console.log(`   New: ${newRecommendation.slice(0, 150)}...`);

      // Update in database
      const now = Math.floor(Date.now() / 1000);
      await executeQuery(
        `UPDATE eroweb_analyses
         SET recommendation = ?, updated_at = ?
         WHERE id = ?`,
        [newRecommendation, now, analysis.id]
      );

      fixed++;
      console.log(`✅ Fixed ${analysis.domain}`);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Total analyses: ${analyses.length}`);
  console.log(`   Found with old text: ${total}`);
  console.log(`   Fixed: ${fixed}`);
}

fixOldRecommendations()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
