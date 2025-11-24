import { NextRequest, NextResponse } from 'next/server';
import { analyzeWebsite } from '@/lib/web-analyzer';
import { adminDbInstance } from '@/lib/firebase-admin';
import { captureMultipleScreenshots } from '@/lib/screenshot';

// Email template types
type EmailTemplate = 'general' | 'slow-web' | 'bad-seo' | 'mobile-issues' | 'outdated-design' | 'follow-up';

// Helper function to sanitize data for Firestore (removes undefined values, converts Dates to ISO strings)
function sanitizeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      const value = obj[key];
      if (value !== undefined) {
        sanitized[key] = sanitizeForFirestore(value);
      }
    }
    return sanitized;
  }
  return obj;
}

function generateEmailSubject(analysis: any, template: EmailTemplate): string {
  const company = analysis.businessName || 'vaší společnosti';

  switch (template) {
    case 'slow-web':
      return `${company} - Pomalý web snižuje vaše tržby`;
    case 'bad-seo':
      return `${company} - Váš web není vidět v Google`;
    case 'mobile-issues':
      return `${company} - Ztrácíte 70% zákazníků kvůli mobilu`;
    case 'outdated-design':
      return `${company} - Zastaralý web odrazuje zákazníky`;
    case 'follow-up':
      return `${company} - Speciální nabídka platná do konce měsíce`;
    default:
      return `${company} - Analýza webu a nabídka optimalizace`;
  }
}

function detectPrimaryIssue(analysis: any): EmailTemplate {
  const { performance, seo, accessibility } = analysis;
  const perfScore = performance?.score || 0;
  const seoScore = seo?.score || 0;
  const accessScore = accessibility?.score || 0;

  // Find the worst metric
  if (perfScore < 50 && perfScore < seoScore && perfScore < accessScore) {
    return 'slow-web';
  }
  if (seoScore < 50 && seoScore < perfScore && seoScore < accessScore) {
    return 'bad-seo';
  }
  if (accessScore < 50 && accessScore < perfScore && accessScore < seoScore) {
    return 'mobile-issues';
  }

  const avgScore = Math.round((perfScore + seoScore + accessScore) / 3);
  if (avgScore < 50) {
    return 'outdated-design';
  }

  return 'general';
}

function generateProposalEmail(analysis: any, templateType?: EmailTemplate): string {
  const template = templateType || detectPrimaryIssue(analysis);

  switch (template) {
    case 'slow-web':
      return generateSlowWebEmail(analysis);
    case 'bad-seo':
      return generateBadSEOEmail(analysis);
    case 'mobile-issues':
      return generateMobileIssuesEmail(analysis);
    case 'outdated-design':
      return generateOutdatedDesignEmail(analysis);
    case 'follow-up':
      return generateFollowUpEmail(analysis);
    default:
      return generateGeneralEmail(analysis);
  }
}

// Original general template
function generateGeneralEmail(analysis: any): string {
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

// Template 1: Slow Web (Performance < 50)
function generateSlowWebEmail(analysis: any): string {
  const { url, contactName, businessName, performance } = analysis;
  const name = contactName || 'vážený zákazníku';
  const company = businessName || 'vaší společnosti';
  const perfScore = performance?.score || 0;

  let email = `Dobrý den ${name},\n\n`;
  email += `zjistili jsme, že web ${company} (${url}) má **vážné problémy s rychlostí**.\n\n`;

  email += `⚠️ KRITICKÝ PROBLÉM\n`;
  email += `─────────────────────\n`;
  email += `Váš web má skóre rychlosti pouze ${perfScore}/100\n\n`;
  email += `To znamená:\n`;
  email += `❌ Návštěvníci odcházejí, než se web načte\n`;
  email += `❌ Google vás penalizuje v žebříčku\n`;
  email += `❌ Ztrácíte zákazníky každý den\n`;
  email += `❌ Mobilní uživatelé mají ještě horší zkušenost\n\n`;

  email += `💡 ŘEŠENÍ: ULTRA-RYCHLÝ WEB\n`;
  email += `─────────────────────\n`;
  email += `Přebudujeme váš web v Next.js 15 místo pomalého WordPressu:\n\n`;
  email += `✓ Načítání **pod 2 sekundy** (místo současných 8+ sekund)\n`;
  email += `✓ Google Core Web Vitals 95+ bodů\n`;
  email += `✓ Lepší pozice ve vyhledávání\n`;
  email += `✓ Až 300% vyšší konverze\n`;
  email += `✓ Moderní design zdarma\n\n`;

  email += `💰 Cena: Od 15 000 Kč (redesign + optimalizace)\n`;
  email += `⏱️ Termín: 7-10 pracovních dní\n`;
  email += `🎁 BONUS: První měsíc údržby ZDARMA\n\n`;

  email += `📊 SROVNÁNÍ\n`;
  email += `─────────────────────\n`;
  email += `Současný stav: ${perfScore}/100 bodů\n`;
  email += `Po optimalizaci: 95+/100 bodů\n`;
  email += `Úspora času: 6+ sekund na načtení\n\n`;

  email += `📞 KONTAKT\n`;
  email += `─────────────────────\n`;
  email += `Zavolejte: +420 702 110 166\n`;
  email += `Email: info@weblyx.cz\n`;
  email += `WhatsApp: wa.me/420702110166\n\n`;
  email += `Každý den prodlení = ztracení zákazníci!\n\n`;
  email += `S pozdravem,\nTým Weblyx\nhttps://weblyx.cz`;

  return email;
}

// Template 2: Bad SEO (SEO < 50)
function generateBadSEOEmail(analysis: any): string {
  const { url, contactName, businessName, seo } = analysis;
  const name = contactName || 'vážený zákazníku';
  const company = businessName || 'vaší společnosti';
  const seoScore = seo?.score || 0;

  let email = `Dobrý den ${name},\n\n`;
  email += `analýza webu ${company} (${url}) odhalila **kritické SEO problémy**.\n\n`;

  email += `🔍 PROBLÉM: NEVIDITELNOST V GOOGLE\n`;
  email += `─────────────────────\n`;
  email += `SEO skóre: ${seoScore}/100 - **Velmi špatné**\n\n`;
  email += `Co to znamená:\n`;
  email += `❌ Google vás nenajde\n`;
  email += `❌ Konkurence vás předběhla\n`;
  email += `❌ Chybějící meta tagy a popisky\n`;
  email += `❌ Žádná strukturovaná data (schema.org)\n`;
  email += `❌ Nulový organický traffic\n\n`;

  email += `💡 ŘEŠENÍ: PROFESIONÁLNÍ SEO\n`;
  email += `─────────────────────\n`;
  email += `Kompletní SEO optimalizace za 8 000 Kč:\n\n`;
  email += `✓ Keyword research pro vaše odvětví\n`;
  email += `✓ Optimalizace všech meta tagů\n`;
  email += `✓ Schema.org strukturovaná data\n`;
  email += `✓ Sitemap a robots.txt\n`;
  email += `✓ Open Graph pro sociální sítě\n`;
  email += `✓ Core Web Vitals optimalizace\n`;
  email += `✓ Měsíční monitoring a reporty\n\n`;

  email += `💰 Cena: Od 8 000 Kč\n`;
  email += `⏱️ Termín: 3-5 pracovních dní\n`;
  email += `📈 Výsledky viditelné za 14-30 dní\n\n`;

  email += `🎯 CO ZÍSKÁTE\n`;
  email += `─────────────────────\n`;
  email += `• 200-500% nárůst organického trafficu\n`;
  email += `• Top 10 pozice pro klíčová slova\n`;
  email += `• Více poptávek bez reklamy\n`;
  email += `• Dlouhodobý růst návštěvnosti\n\n`;

  email += `📞 KONTAKT\n`;
  email += `─────────────────────\n`;
  email += `Zavolejte: +420 702 110 166\n`;
  email += `Email: info@weblyx.cz\n\n`;
  email += `Každý měsíc bez SEO = ztracené příležitosti!\n\n`;
  email += `S pozdravem,\nTým Weblyx\nhttps://weblyx.cz`;

  return email;
}

// Template 3: Mobile Issues (Accessibility < 50)
function generateMobileIssuesEmail(analysis: any): string {
  const { url, contactName, businessName, accessibility } = analysis;
  const name = contactName || 'vážený zákazníku';
  const company = businessName || 'vaší společnosti';
  const accessScore = accessibility?.score || 0;

  let email = `Dobrý den ${name},\n\n`;
  email += `web ${company} (${url}) má **vážné problémy na mobilních zařízeních**.\n\n`;

  email += `📱 KRITICKÝ PROBLÉM\n`;
  email += `─────────────────────\n`;
  email += `Přístupnost/Mobilní: ${accessScore}/100\n\n`;
  email += `Víte, že:\n`;
  email += `📊 70% návštěvníků používá mobil\n`;
  email += `❌ Váš web na mobilu nefunguje správně\n`;
  email += `❌ Google penalizuje non-mobile weby\n`;
  email += `❌ Ztrácíte 7 z 10 potenciálních zákazníků\n\n`;

  email += `💡 ŘEŠENÍ: MOBILE-FIRST DESIGN\n`;
  email += `─────────────────────\n`;
  email += `Přebudujeme váš web s důrazem na mobil:\n\n`;
  email += `✓ 100% responzivní design\n`;
  email += `✓ Touch-friendly tlačítka a menu\n`;
  email += `✓ Rychlé načítání na 3G/4G\n`;
  email += `✓ Optimalizované obrázky pro mobil\n`;
  email += `✓ Přístupnost pro všechna zařízení\n`;
  email += `✓ Google Mobile-Friendly test: PASS\n\n`;

  email += `💰 Cena: Od 12 000 Kč\n`;
  email += `⏱️ Termín: 5-7 pracovních dní\n`;
  email += `🎁 BONUS: Mobilní app vzhled zdarma\n\n`;

  email += `📊 DOPAD NA BYZNYS\n`;
  email += `─────────────────────\n`;
  email += `Po mobilní optimalizaci:\n`;
  email += `• +150% konverze z mobilu\n`;
  email += `• +200% času stráveného na webu\n`;
  email += `• +80% návratnost návštěvníků\n`;
  email += `• Lepší pozice v Google\n\n`;

  email += `📞 KONTAKT\n`;
  email += `─────────────────────\n`;
  email += `Zavolejte: +420 702 110 166\n`;
  email += `Email: info@weblyx.cz\n\n`;
  email += `Mobilní web = základ úspěchu v roce 2025!\n\n`;
  email += `S pozdravem,\nTým Weblyx\nhttps://weblyx.cz`;

  return email;
}

// Template 4: Outdated Design (avgScore < 50)
function generateOutdatedDesignEmail(analysis: any): string {
  const { url, contactName, businessName } = analysis;
  const name = contactName || 'vážený zákazníku';
  const company = businessName || 'vaší společnosti';

  let email = `Dobrý den ${name},\n\n`;
  email += `vaš web ${company} (${url}) působí **zastarale a neprofesionálně**.\n\n`;

  email += `🎨 PROBLÉM: ZASTARALÝ DESIGN\n`;
  email += `─────────────────────\n`;
  email += `Váš web vypadá jako z roku 2010:\n\n`;
  email += `❌ Zastaralý vzhled odrazuje zákazníky\n`;
  email += `❌ Nízká důvěryhodnost\n`;
  email += `❌ Konkurence vypadá lépe\n`;
  email += `❌ Vysoký bounce rate (90%+)\n\n`;

  email += `💡 ŘEŠENÍ: MODERNÍ REDESIGN 2025\n`;
  email += `─────────────────────\n`;
  email += `Kompletní redesign za 15 000 Kč:\n\n`;
  email += `✓ Moderní minimalistický design\n`;
  email += `✓ Profesionální UI/UX\n`;
  email += `✓ Trendy 2025 (glassmorphism, gradients)\n`;
  email += `✓ Animace a smooth scrolling\n`;
  email += `✓ Optimalizace konverzí (CTA, formuláře)\n`;
  email += `✓ Brand identity refresh\n`;
  email += `✓ Next.js místo WordPressu\n\n`;

  email += `💰 Cena: Od 15 000 Kč\n`;
  email += `⏱️ Termín: 7-10 pracovních dní\n`;
  email += `🎁 AKCE: Logo refresh ZDARMA (v ceně)\n\n`;

  email += `📊 VÝSLEDKY NAŠICH KLIENTŮ\n`;
  email += `─────────────────────\n`;
  email += `Náš redesign typicky přinese:\n`;
  email += `• +300% konverze\n`;
  email += `• -70% bounce rate\n`;
  email += `• +200% času na webu\n`;
  email += `• Lepší pozice v Google\n\n`;

  email += `📞 KONTAKT\n`;
  email += `─────────────────────\n`;
  email += `Zavolejte: +420 702 110 166\n`;
  email += `Email: info@weblyx.cz\n`;
  email += `WhatsApp: wa.me/420702110166\n\n`;
  email += `První dojem rozhoduje - získejte zákazníky na první pohled!\n\n`;
  email += `S pozdravem,\nTým Weblyx\nhttps://weblyx.cz`;

  return email;
}

// Template 5: Follow-up Email (po 7 dnech)
function generateFollowUpEmail(analysis: any): string {
  const { url, contactName, businessName } = analysis;
  const name = contactName || 'vážený zákazníku';
  const company = businessName || 'vaší společnosti';

  let email = `Dobrý den ${name},\n\n`;
  email += `před týdnem jsme vám zaslali analýzu webu ${company} (${url}).\n\n`;

  email += `❓ STÁLE VÁHÁTE?\n`;
  email += `─────────────────────\n`;
  email += `Rozumíme, že rozhodnutí o redesignu webu chce rozvahu.\n\n`;
  email += `Můžeme vám nabídnout:\n\n`;

  email += `💡 ZDARMA PRO VÁS\n`;
  email += `─────────────────────\n`;
  email += `✓ 30min konzultace zdarma\n`;
  email += `✓ Konkrétní návrhy řešení\n`;
  email += `✓ Ukázka před/po z našeho portfolia\n`;
  email += `✓ Detailní cenová kalkulace\n`;
  email += `✓ Časový plán projektu\n\n`;

  email += `🎁 SPECIÁLNÍ NABÍDKA\n`;
  email += `─────────────────────\n`;
  email += `Pokud se rozhodnete do konce měsíce:\n\n`;
  email += `• -15% sleva na celý projekt\n`;
  email += `• První 2 měsíce údržby ZDARMA\n`;
  email += `• Prioritní termín (start do 3 dní)\n`;
  email += `• Logo/grafika zdarma (v ceně)\n\n`;

  email += `📊 ZATÍM ZTRÁCÍTE\n`;
  email += `─────────────────────\n`;
  email += `Každý týden bez optimalizace:\n`;
  email += `• Průměrně 50-100 ztracených návštěvníků\n`;
  email += `• 10-20 ztracených poptávek\n`;
  email += `• Konkurence vás předbíhá\n`;
  email += `• Google vás penalizuje\n\n`;

  email += `📞 MÁTE OTÁZKY?\n`;
  email += `─────────────────────\n`;
  email += `Rádi zodpovíme cokoliv:\n\n`;
  email += `Zavolejte: +420 702 110 166\n`;
  email += `Email: info@weblyx.cz\n`;
  email += `WhatsApp: wa.me/420702110166\n\n`;
  email += `Nebo si rovnou domluvte nezávaznou schůzku:\n`;
  email += `https://weblyx.cz/kontakt\n\n`;

  email += `⏰ ZBÝVÁ POUZE ${30 - 7} DNÍ NA SLEVU!\n\n`;
  email += `Těšíme se na spolupráci,\nTým Weblyx\nhttps://weblyx.cz`;

  return email;
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

    // Run analysis and capture screenshots in parallel
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

    const [analysis, screenshots] = await Promise.all([
      analyzeWebsite(url),
      captureMultipleScreenshots(normalizedUrl).catch(err => {
        console.error('Screenshot error:', err);
        return null; // Don't fail entire analysis if screenshots fail
      }),
    ]);

    // Add contact info if provided
    if (contactEmail) analysis.contactEmail = contactEmail;
    if (contactName) analysis.contactName = contactName;
    if (businessName) analysis.businessName = businessName;

    // Add screenshots (as base64) if available
    if (screenshots) {
      analysis.screenshots = {
        desktop: screenshots.desktop.toString('base64'),
        tablet: screenshots.tablet.toString('base64'),
        mobile: screenshots.mobile.toString('base64'),
      };
    }

    // Detect primary issue for template selection
    const primaryIssue = detectPrimaryIssue(analysis);

    // Generate all email templates
    const emailTemplates = {
      general: generateGeneralEmail(analysis),
      slowWeb: generateSlowWebEmail(analysis),
      badSEO: generateBadSEOEmail(analysis),
      mobileIssues: generateMobileIssuesEmail(analysis),
      outdatedDesign: generateOutdatedDesignEmail(analysis),
      followUp: generateFollowUpEmail(analysis),
    };

    // Generate email subjects for all templates
    const emailSubjects = {
      general: generateEmailSubject(analysis, 'general'),
      slowWeb: generateEmailSubject(analysis, 'slow-web'),
      badSEO: generateEmailSubject(analysis, 'bad-seo'),
      mobileIssues: generateEmailSubject(analysis, 'mobile-issues'),
      outdatedDesign: generateEmailSubject(analysis, 'outdated-design'),
      followUp: generateEmailSubject(analysis, 'follow-up'),
    };

    // Primary email (automatically selected based on issues)
    const proposalEmail = generateProposalEmail(analysis);
    const proposalSubject = generateEmailSubject(analysis, primaryIssue);

    // Save to database
    let analysisId: string | undefined;

    if (adminDbInstance) {
      // Sanitize all data before saving to Firestore
      const dataToSave = sanitizeForFirestore({
        ...analysis,
        primaryIssue, // Store which template was auto-selected
        proposalEmail, // Primary email
        proposalSubject, // Primary email subject
        emailTemplates, // All available templates
        emailSubjects, // All email subjects
        analyzedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await adminDbInstance.collection('web_analyses').add(dataToSave);
      analysisId = result.id;
    }

    return NextResponse.json({
      success: true,
      data: {
        ...analysis,
        id: analysisId,
        primaryIssue, // Which template was selected
        proposalEmail, // Primary email
        proposalSubject, // Primary email subject
        emailTemplates, // All templates available for manual selection
        emailSubjects, // All subjects for manual selection
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
