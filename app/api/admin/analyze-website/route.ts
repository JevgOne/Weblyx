import { NextRequest, NextResponse } from 'next/server';
import { analyzeWebsite } from '@/lib/web-analyzer';
import { adminDbInstance } from '@/lib/firebase-admin';

function generateProposalEmail(analysis: any): string {
  const { url, contactName, businessName, performance, seo, accessibility, issues } = analysis;

  const name = contactName || 'vážený zákazníku';
  const company = businessName || 'vaší společnosti';

  // Calculate overall score
  const scores = [performance?.score || 0, seo?.score || 0, accessibility?.score || 0];
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  // Determine severity
  const criticalIssues = issues?.filter((i: any) => i.severity === 'high').length || 0;
  const moderateIssues = issues?.filter((i: any) => i.severity === 'medium').length || 0;

  let greeting = `Dobrý den ${name},\n\n`;
  greeting += `děkujeme za zájem o naše služby. Provedli jsme analýzu webu ${company} (${url}) a rádi bychom vám představili naši nabídku.\n\n`;

  // Analysis summary
  let summary = `📊 VÝSLEDKY ANALÝZY\n`;
  summary += `─────────────────────\n`;
  summary += `Celkové skóre: ${avgScore}/100\n`;
  summary += `• Výkon: ${performance?.score || 0}/100\n`;
  summary += `• SEO: ${seo?.score || 0}/100\n`;
  summary += `• Přístupnost: ${accessibility?.score || 0}/100\n\n`;

  if (criticalIssues > 0 || moderateIssues > 0) {
    summary += `⚠️ ZJIŠTĚNÉ PROBLÉMY\n`;
    summary += `─────────────────────\n`;
    if (criticalIssues > 0) summary += `• ${criticalIssues}x kritické problémy\n`;
    if (moderateIssues > 0) summary += `• ${moderateIssues}x středně závažné problémy\n`;
    summary += `\n`;
  }

  // Offer based on score
  let offer = `💡 NAŠE NABÍDKA PRO ${company.toUpperCase()}\n`;
  offer += `─────────────────────\n\n`;

  if (avgScore < 50) {
    offer += `Na základě analýzy doporučujeme:\n\n`;
    offer += `🔄 KOMPLETNÍ REDESIGN WEBU\n`;
    offer += `• Moderní design odpovídající roku 2025\n`;
    offer += `• Next.js 15 pro maximální rychlost (pod 2 sekundy)\n`;
    offer += `• Plná SEO optimalizace (meta tagy, schema.org)\n`;
    offer += `• Responzivní design pro všechna zařízení\n`;
    offer += `• Google Analytics & sledování konverzí\n\n`;
    offer += `💰 Cena: Od 15 000 Kč\n`;
    offer += `⏱️ Termín: 7-10 pracovních dní\n`;
  } else if (avgScore < 75) {
    offer += `Váš web má potenciál! Nabízíme:\n\n`;
    offer += `⚡ OPTIMALIZACE & VYLEPŠENÍ\n`;
    offer += `• Zvýšení rychlosti načítání\n`;
    offer += `• SEO optimalizace (meta tagy, sitemap, schema.org)\n`;
    offer += `• Opravy přístupnosti\n`;
    offer += `• Úpravy designu\n`;
    offer += `• Integrace analytics\n\n`;
    offer += `💰 Cena: Od 8 000 Kč\n`;
    offer += `⏱️ Termín: 3-5 pracovních dní\n`;
  } else {
    offer += `Váš web je v dobré kondici! Můžeme nabídnout:\n\n`;
    offer += `🚀 DROBNÁ VYLEPŠENÍ\n`;
    offer += `• Fine-tuning výkonu\n`;
    offer += `• Doplnění chybějících SEO prvků\n`;
    offer += `• Pravidelná údržba a aktualizace\n`;
    offer += `• Technická podpora\n\n`;
    offer += `💰 Cena: Od 5 000 Kč jednorázově nebo 2 000 Kč/měsíc údržba\n`;
    offer += `⏱️ Termín: 1-3 pracovní dny\n`;
  }

  offer += `\n`;

  // Why choose us
  let why = `✨ PROČ WEBLYX?\n`;
  why += `─────────────────────\n`;
  why += `✓ Moderní technologie (Next.js 15, Turso)\n`;
  why += `✓ Nejrychlejší načítání (pod 2 sekundy)\n`;
  why += `✓ Férové ceny bez skrytých poplatků\n`;
  why += `✓ Dodání do týdne\n`;
  why += `✓ SEO optimalizace zdarma\n`;
  why += `✓ Technická podpora 24/7\n\n`;

  // CTA
  let cta = `📞 DALŠÍ KROKY\n`;
  cta += `─────────────────────\n`;
  cta += `Rádi s vámi probereme podrobnosti!\n\n`;
  cta += `• Zavolejte: +420 702 110 166\n`;
  cta += `• Email: info@weblyx.cz\n`;
  cta += `• WhatsApp: wa.me/420702110166\n`;
  cta += `• Web: https://weblyx.cz\n\n`;
  cta += `Těšíme se na spolupráci!\n\n`;
  cta += `S pozdravem,\n`;
  cta += `Tým Weblyx\n`;
  cta += `https://weblyx.cz`;

  return greeting + summary + offer + why + cta;
}

export async function POST(request: NextRequest) {
  try {
    const { url, contactEmail, contactName, businessName } = await request.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Run analysis
    const analysis = await analyzeWebsite(url);

    // Add contact info if provided
    if (contactEmail) analysis.contactEmail = contactEmail;
    if (contactName) analysis.contactName = contactName;
    if (businessName) analysis.businessName = businessName;

    // Generate proposal email
    const proposalEmail = generateProposalEmail(analysis);

    // Save to database
    let analysisId: string | undefined;

    if (adminDbInstance) {
      const result = await adminDbInstance.collection('web_analyses').add({
        ...analysis,
        proposalEmail, // Save generated email
        analyzedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      analysisId = result.id;
    }

    return NextResponse.json({
      success: true,
      data: {
        ...analysis,
        id: analysisId,
        proposalEmail, // Include email in response
      },
    });
  } catch (error: any) {
    console.error('Web analysis error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to analyze website'
      },
      { status: 500 }
    );
  }
}

// GET - Retrieve all analyses
export async function GET(request: NextRequest) {
  try {
    if (!adminDbInstance) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 500 }
      );
    }

    // Check if we're using mock Firebase
    if (typeof adminDbInstance.collection === 'function') {
      // Mock Firebase
      const snapshot = await adminDbInstance.collection('web_analyses').orderBy('analyzedAt').get();
      const analyses: any[] = [];

      snapshot.docs.forEach((doc: any) => {
        analyses.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Sort manually for mock
      analyses.sort((a, b) => {
        const aDate = a.analyzedAt?.toDate ? a.analyzedAt.toDate() : new Date(a.analyzedAt);
        const bDate = b.analyzedAt?.toDate ? b.analyzedAt.toDate() : new Date(b.analyzedAt);
        return bDate.getTime() - aDate.getTime();
      });

      return NextResponse.json({
        success: true,
        data: analyses,
      });
    } else {
      // Real Firebase - use modular API
      const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
      const db = adminDbInstance as any;
      const q = query(collection(db, 'web_analyses'), orderBy('analyzedAt', 'desc'));
      const snapshot = await getDocs(q);

      const analyses: any[] = [];
      snapshot.forEach((doc) => {
        analyses.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return NextResponse.json({
        success: true,
        data: analyses,
      });
    }
  } catch (error: any) {
    console.error('Error fetching analyses:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch analyses'
      },
      { status: 500 }
    );
  }
}
