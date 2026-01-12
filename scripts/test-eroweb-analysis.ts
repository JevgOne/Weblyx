// Test Eroweb Analysis API
// This script tests the analysis endpoint on production

async function testErowebAnalysis() {
  console.log('🧪 Testing Eroweb Analysis...\n');

  const testUrl = 'https://weblyx.cz'; // Using our own site for testing
  const businessType = 'massage'; // Test with massage type
  const apiUrl = 'http://localhost:3000/api/eroweb/analyze'; // Test locally

  console.log(`📝 Test parameters:`);
  console.log(`   URL: ${testUrl}`);
  console.log(`   Business Type: ${businessType}`);
  console.log(`   API: ${apiUrl}`);
  console.log(`\n🚀 Sending request to API...\n`);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://weblyx.cz',
        'Referer': 'https://weblyx.cz/admin/eroweb-analyza',
      },
      body: JSON.stringify({
        url: testUrl,
        businessType: businessType,
        contactName: 'Test User',
        contactEmail: 'test@weblyx.cz',
      }),
    });

    console.log(`📊 Response Status: ${response.status} ${response.statusText}\n`);

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Analysis failed!');
      console.error('Error:', data.error);
      if (data.details) {
        console.error('Details:', data.details);
      }
      process.exit(1);
    }

    console.log('✅ Analysis completed successfully!\n');

    console.log('📈 Results:');
    console.log('─────────────────────────────────────');
    console.log(`Analysis ID: ${data.analysisId}`);
    console.log(`Domain: ${data.domain}`);
    console.log(`Business Type: ${data.businessType}`);
    console.log(`\n📊 Scores:`);
    console.log(`   Speed:    ${data.scores.speed}/20`);
    console.log(`   Mobile:   ${data.scores.mobile}/15`);
    console.log(`   Security: ${data.scores.security}/10`);
    console.log(`   SEO:      ${data.scores.seo}/20`);
    console.log(`   GEO:      ${data.scores.geo}/15`);
    console.log(`   Design:   ${data.scores.design}/20`);
    console.log(`   ────────────────────────`);
    console.log(`   TOTAL:    ${data.scores.total}/100 🎯`);

    console.log(`\n🎁 Recommended Package: ${data.recommendedPackage.toUpperCase()}`);

    console.log(`\n⚠️  Top Findings (${data.findings.length}):`);
    data.findings.slice(0, 5).forEach((finding: any, i: number) => {
      const icon = finding.type === 'critical' ? '🔴' : finding.type === 'warning' ? '🟡' : '🟢';
      console.log(`   ${i + 1}. ${icon} [${finding.category}] ${finding.title}`);
    });

    console.log(`\n💡 Recommendation Preview:`);
    console.log(`   ${data.recommendation.substring(0, 150)}...`);

    console.log('\n✅ Test PASSED - Eroweb analyzer is working correctly!');
    console.log('─────────────────────────────────────\n');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Test FAILED - Network or API error');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testErowebAnalysis();
