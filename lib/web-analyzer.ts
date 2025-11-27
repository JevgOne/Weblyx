import * as cheerio from 'cheerio';
import {
  WebAnalysisTechnical,
  WebAnalysisIssue,
  PackageRecommendation,
  WebAnalysisResult,
  WebAnalysisContent,
  WebAnalysisTechnology,
  WebAnalysisSecurity,
  WebAnalysisPerformance
} from '@/types/cms';

interface AnalyzeOptions {
  url: string;
  timeout?: number;
}

export class WebAnalyzer {
  private url: string;
  private html: string = '';
  private $: cheerio.CheerioAPI | null = null;
  private responseHeaders: Headers | null = null;

  constructor(url: string) {
    this.url = this.normalizeUrl(url);
  }

  private normalizeUrl(url: string): string {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  }

  async fetchWebsite(timeout: number = 10000): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(this.url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      this.html = await response.text();
      this.$ = cheerio.load(this.html);
      this.responseHeaders = response.headers;
    } catch (error: any) {
      throw new Error(`Failed to fetch website: ${error.message}`);
    }
  }

  analyzeTechnical(): WebAnalysisTechnical {
    if (!this.$) throw new Error('No HTML loaded');

    const $ = this.$;

    // Meta tags
    const title = $('title').text() || null;
    const description = $('meta[name="description"]').attr('content') || null;
    const keywordsContent = $('meta[name="keywords"]').attr('content');
    const keywords = keywordsContent
      ? keywordsContent.split(',').map(k => k.trim()).filter(Boolean)
      : [];

    // Headings structure
    const h1Elements = $('h1');
    const headingsStructure = {
      h1: h1Elements.length,
      h2: $('h2').length,
      h3: $('h3').length,
      h4: $('h4').length,
      h5: $('h5').length,
      h6: $('h6').length,
    };

    // Images
    const images = $('img');
    const totalImages = images.length;
    const imagesWithoutAlt = images.filter((_, el) => !$(el).attr('alt')).length;

    // Links
    const links = $('a[href]');
    let internalLinks = 0;
    let externalLinks = 0;

    links.each((_, el) => {
      const href = $(el).attr('href') || '';
      if (href.startsWith('http') && !href.includes(new URL(this.url).hostname)) {
        externalLinks++;
      } else if (!href.startsWith('http') || href.includes(new URL(this.url).hostname)) {
        internalLinks++;
      }
    });

    // SSL
    const hasSSL = this.url.startsWith('https://');

    // Schema markup
    const schemaMarkup = $('script[type="application/ld+json"]').length > 0;

    // Basic mobile check (viewport meta tag)
    const mobileResponsive = $('meta[name="viewport"]').length > 0;

    return {
      title,
      description,
      keywords,
      hasH1: headingsStructure.h1 > 0,
      h1Count: headingsStructure.h1,
      headingsStructure,
      imagesWithoutAlt,
      totalImages,
      internalLinks,
      externalLinks,
      hasSitemap: false, // Will check separately
      hasRobotsTxt: false, // Will check separately
      loadTime: 0, // Measured during fetch
      mobileResponsive,
      hasSSL,
      schemaMarkup,
    };
  }

  async checkSitemap(): Promise<boolean> {
    try {
      const sitemapUrl = new URL('/sitemap.xml', this.url).toString();
      const response = await fetch(sitemapUrl, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  async checkRobotsTxt(): Promise<boolean> {
    try {
      const robotsUrl = new URL('/robots.txt', this.url).toString();
      const response = await fetch(robotsUrl, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  identifyIssues(
    technical: WebAnalysisTechnical,
    content?: WebAnalysisContent,
    security?: WebAnalysisSecurity,
    performance?: WebAnalysisPerformance
  ): WebAnalysisIssue[] {
    const issues: WebAnalysisIssue[] = [];

    // Critical issues
    if (!technical.hasSSL) {
      issues.push({
        category: 'critical',
        title: 'Chybí SSL certifikát (HTTPS)',
        description: 'Web nepoužívá zabezpečené HTTPS spojení',
        impact: 'Google penalizuje nešifrované weby, uživatelé vidí varování',
        recommendation: 'Nainstalovat SSL certifikát (Let\'s Encrypt zdarma)'
      });
    }

    if (!technical.title) {
      issues.push({
        category: 'critical',
        title: 'Chybí title tag',
        description: 'Stránka nemá definovaný titulek',
        impact: 'Zásadní problém pro SEO, stránka se neukazuje správně ve vyhledávání',
        recommendation: 'Přidat unikátní title tag (50-60 znaků)'
      });
    }

    if (!technical.hasH1) {
      issues.push({
        category: 'critical',
        title: 'Chybí H1 nadpis',
        description: 'Stránka nemá hlavní H1 nadpis',
        impact: 'Vyhledávače nerozumí tématu stránky',
        recommendation: 'Přidat jeden hlavní H1 nadpis s klíčovými slovy'
      });
    }

    if (technical.h1Count > 1) {
      issues.push({
        category: 'warning',
        title: 'Více H1 nadpisů',
        description: `Stránka má ${technical.h1Count} H1 nadpisů`,
        impact: 'Matoucí pro vyhledávače, snižuje SEO hodnotu',
        recommendation: 'Použít pouze jeden H1 nadpis na stránce'
      });
    }

    // Warning issues
    if (!technical.description) {
      issues.push({
        category: 'warning',
        title: 'Chybí meta description',
        description: 'Stránka nemá meta description tag',
        impact: 'Google vytvoří vlastní popis, který nemusí být ideální',
        recommendation: 'Přidat meta description (150-160 znaků)'
      });
    }

    if (!technical.mobileResponsive) {
      issues.push({
        category: 'critical',
        title: 'Web není optimalizován pro mobily',
        description: 'Chybí viewport meta tag',
        impact: 'Špatná použitelnost na mobilech, Google Mobile-First penalizace',
        recommendation: 'Přidat viewport meta tag a responzivní design'
      });
    }

    if (technical.imagesWithoutAlt > 0) {
      issues.push({
        category: 'warning',
        title: 'Obrázky bez ALT atributu',
        description: `${technical.imagesWithoutAlt} z ${technical.totalImages} obrázků nemá ALT text`,
        impact: 'Snížené SEO, problémy s přístupností',
        recommendation: 'Přidat popisný ALT text ke všem obrázkům'
      });
    }

    if (!technical.hasSitemap) {
      issues.push({
        category: 'warning',
        title: 'Chybí sitemap.xml',
        description: 'Web nemá XML sitemapu',
        impact: 'Vyhledávače mohou mít problém najít všechny stránky',
        recommendation: 'Vytvořit a nahrát sitemap.xml'
      });
    }

    if (!technical.hasRobotsTxt) {
      issues.push({
        category: 'info',
        title: 'Chybí robots.txt',
        description: 'Web nemá soubor robots.txt',
        impact: 'Menší problém, ale doporučuje se mít',
        recommendation: 'Vytvořit robots.txt soubor'
      });
    }

    if (!technical.schemaMarkup) {
      issues.push({
        category: 'info',
        title: 'Chybí strukturovaná data (Schema.org)',
        description: 'Web nepoužívá JSON-LD schema markup',
        impact: 'Ztracená příležitost pro rich snippets v Google',
        recommendation: 'Implementovat schema.org markup (Organization, LocalBusiness)'
      });
    }

    if (technical.keywords && technical.keywords.length === 0) {
      issues.push({
        category: 'info',
        title: 'Chybí meta keywords',
        description: 'Stránka nemá definovaná klíčová slova',
        impact: 'Menší dopad na SEO (Google je ignoruje, ale jiné vyhledávače ne)',
        recommendation: 'Přidat 5-10 relevantních keywords'
      });
    }

    // NEW: Content issues
    if (content) {
      if (content.wordCount < 300) {
        issues.push({
          category: 'warning',
          title: 'Málo textového obsahu',
          description: `Stránka má pouze ${content.wordCount} slov`,
          impact: 'Google preferuje obsáhlejší a hodnotnější obsah (min. 300-500 slov)',
          recommendation: 'Přidat více kvalitního textového obsahu relevantního pro vaše zákazníky'
        });
      }

      if (content.readabilityScore < 40) {
        issues.push({
          category: 'info',
          title: 'Těžko čitelný text',
          description: `Readability skóre: ${content.readabilityScore}/100 (${content.readabilityLevel})`,
          impact: 'Složitý text odradí návštěvníky a snižuje konverze',
          recommendation: 'Zjednodušit text, používat kratší věty a jednodušší slova'
        });
      }
    }

    // NEW: Security issues
    if (security) {
      if (security.securityScore < 50) {
        issues.push({
          category: 'critical',
          title: 'Vážné bezpečnostní nedostatky',
          description: `Security skóre: ${security.securityScore}/100`,
          impact: 'Zranitelnost vůči hackingu, phishingu a data breaches',
          recommendation: 'Implementovat security headers (HSTS, CSP, X-Frame-Options)'
        });
      } else if (security.securityScore < 80) {
        issues.push({
          category: 'warning',
          title: 'Chybějící bezpečnostní hlavičky',
          description: `Security skóre: ${security.securityScore}/100`,
          impact: 'Snížená ochrana před XSS útoky a clickjackingem',
          recommendation: 'Přidat chybějící security headers pro lepší ochranu'
        });
      }

      if (security.mixedContent) {
        issues.push({
          category: 'warning',
          title: 'Mixed content warning',
          description: 'Web načítá HTTP zdroje na HTTPS stránce',
          impact: 'Prohlížeče varují uživatele, snížená důvěra',
          recommendation: 'Přepsat všechny HTTP odkazy na HTTPS'
        });
      }
    }

    // NEW: Performance issues
    if (performance) {
      if (performance.estimatedScore < 50) {
        issues.push({
          category: 'critical',
          title: 'Velmi pomalé načítání',
          description: `Performance skóre: ${performance.estimatedScore}/100`,
          impact: 'Návštěvníci odchází před načtením, vysoký bounce rate',
          recommendation: 'Optimalizovat obrázky, minifikovat CSS/JS, použít CDN'
        });
      } else if (performance.estimatedScore < 75) {
        issues.push({
          category: 'warning',
          title: 'Pomalé načítání',
          description: `Performance skóre: ${performance.estimatedScore}/100`,
          impact: 'Suboptimální uživatelská zkušenost, nižší SEO ranking',
          recommendation: 'Optimalizovat velikost stránky a počet HTTP requestů'
        });
      }

      if (performance.largeImages > 0) {
        issues.push({
          category: 'warning',
          title: 'Neoptimalizované obrázky',
          description: `${performance.largeImages} velkých obrázků zpomaluje načítání`,
          impact: 'Pomalé načítání zejména na mobilních zařízeních',
          recommendation: 'Komprimovat obrázky, použít WebP formát, lazy loading'
        });
      }

      if (!performance.hasCompression) {
        issues.push({
          category: 'info',
          title: 'Chybí komprese (gzip/brotli)',
          description: 'Server nenabízí kompresi dat',
          impact: 'Větší přenesená data, pomalejší načítání',
          recommendation: 'Zapnout gzip nebo brotli kompresi na serveru'
        });
      }
    }

    return issues;
  }

  calculateScore(issues: WebAnalysisIssue[]): number {
    let score = 100;

    issues.forEach(issue => {
      if (issue.category === 'critical') {
        score -= 15;
      } else if (issue.category === 'warning') {
        score -= 8;
      } else {
        score -= 3;
      }
    });

    return Math.max(0, Math.min(100, score));
  }

  recommendPackage(
    technical: WebAnalysisTechnical,
    issues: WebAnalysisIssue[],
    score: number
  ): PackageRecommendation {
    const criticalCount = issues.filter(i => i.category === 'critical').length;
    const warningCount = issues.filter(i => i.category === 'warning').length;
    const infoCount = issues.filter(i => i.category === 'info').length;

    // Analyze specific problems
    const needsSEO = !technical.title || !technical.description || !technical.hasH1;
    const needsRedesign = !technical.mobileResponsive || criticalCount > 2;
    const hasPerformanceIssues = issues.some(i => i.title.includes('načítání') || i.title.includes('Performance'));
    const hasSecurityIssues = issues.some(i => i.title.includes('bezpečnost') || i.title.includes('Security'));
    const hasSEOIssues = issues.some(i => i.title.includes('SEO') || i.category === 'critical');

    // Score ranges:
    // 90-100: Excellent (minor improvements)
    // 75-89: Good (needs optimization)
    // 50-74: Poor (needs major work)
    // 0-49: Critical (needs complete rebuild)

    // KRITICKÝ STAV (0-49 bodů) - Potřebuje kompletní rebuild
    if (score < 50 || criticalCount >= 4) {
      return {
        packageId: 'tier-3',
        packageName: 'Standardní Web',
        confidence: 95,
        reasoning: `Váš web má kritické problémy (skóre ${score}/100). Doporučujeme kompletní redesign s důrazem na SEO, výkon a bezpečnost.`,
        matchedNeeds: [
          'Kompletní SEO optimalizace',
          'Moderní responzivní design',
          'Technická excelence',
          'Bezpečnostní standardy',
          'CMS pro snadnou správu'
        ]
      };
    }

    // VÁŽNÉ PROBLÉMY (50-64 bodů) - Potřebuje velké úpravy
    if (score < 65 || (criticalCount >= 2 && warningCount >= 2)) {
      if (hasSecurityIssues && hasPerformanceIssues) {
        return {
          packageId: 'tier-3',
          packageName: 'Standardní Web',
          confidence: 90,
          reasoning: `Váš web má vážné problémy s bezpečností a výkonem (skóre ${score}/100). Standardní balíček zajistí moderní, rychlý a bezpečný web.`,
          matchedNeeds: [
            'Bezpečnostní optimalizace',
            'Výkonnostní tuning',
            'SEO optimalizace',
            'Responzivní design',
            'Pokročilé funkce'
          ]
        };
      }
      return {
        packageId: 'tier-2',
        packageName: 'Základní Web',
        confidence: 85,
        reasoning: `Váš web potřebuje zásadní vylepšení (skóre ${score}/100). Základní balíček vyřeší hlavní problémy a zlepší SEO.`,
        matchedNeeds: [
          'SEO optimalizace',
          'Moderní design',
          'Oprava technických chyb',
          'Blog s CMS editorem',
          'Responzivita'
        ]
      };
    }

    // STŘEDNÍ PROBLÉMY (65-74 bodů) - Potřebuje optimalizaci
    if (score < 75 || (criticalCount >= 1 && warningCount >= 2)) {
      if (hasSEOIssues && !technical.mobileResponsive) {
        return {
          packageId: 'tier-2',
          packageName: 'Základní Web',
          confidence: 80,
          reasoning: `Váš web má problémy se SEO a chybí mu mobilní optimalizace (skóre ${score}/100). Základní balíček to vyřeší.`,
          matchedNeeds: [
            'Pokročilé SEO',
            'Mobilní optimalizace',
            'Blog s CMS',
            'Sociální sítě',
            'Podpora 2 měsíce'
          ]
        };
      }
      return {
        packageId: 'tier-1',
        packageName: 'Landing Page',
        confidence: 75,
        reasoning: `Váš web má drobné problémy (skóre ${score}/100). Landing Page balíček vyřeší základy a nastartuje váš růst.`,
        matchedNeeds: [
          'SEO základy',
          'Responzivní design',
          'Kontaktní formulář',
          'Google Analytics',
          'Rychlé dodání (3-5 dní)'
        ]
      };
    }

    // DROBNÉ PROBLÉMY (75-89 bodů) - Potřebuje vylepšení
    if (score < 90) {
      if (warningCount >= 2 || infoCount >= 3) {
        return {
          packageId: 'tier-1',
          packageName: 'Landing Page',
          confidence: 70,
          reasoning: `Váš web je slušný (skóre ${score}/100), ale má rezervy. Landing Page balíček doplní chybějící prvky.`,
          matchedNeeds: [
            'SEO optimalizace',
            'Responzivní design',
            'Analytika',
            'Formuláře',
            'Rychlá podpora'
          ]
        };
      }
      return {
        packageId: 'tier-2',
        packageName: 'Základní Web',
        confidence: 75,
        reasoning: `Váš web funguje dobře (skóre ${score}/100), ale má prostor pro růst. Základní balíček ho posune na další level.`,
        matchedNeeds: [
          'Rozšíření o blog',
          'Pokročilé SEO',
          'CMS editor',
          'Sociální sítě',
          'Profesionální design'
        ]
      };
    }

    // VÝBORNÝ STAV (90-100 bodů) - Minimální problémy
    return {
      packageId: 'tier-1',
      packageName: 'Landing Page',
      confidence: 60,
      reasoning: `Váš web je ve skvělém stavu (skóre ${score}/100)! Potřebujete jen drobné vylepšení nebo novou landing page pro kampaň.`,
      matchedNeeds: [
        'Optimalizace pro kampaně',
        'A/B testování',
        'Konverzní prvky',
        'Analytika',
        'Podpora'
      ]
    };
  }

  // Content Analysis - Readability & Word Count
  analyzeContent(): WebAnalysisContent {
    if (!this.$) throw new Error('No HTML loaded');

    const $ = this.$;

    try {
      // Extract text from body, excluding scripts and styles
      const bodyText = $('body')
        .clone()
        .find('script, style, nav, footer, header')
        .remove()
        .end()
        .text()
        .trim();

      // Word count
      const words = bodyText.split(/\s+/).filter(w => w.length > 0);
      const wordCount = Math.max(1, words.length); // Minimum 1 to avoid division by zero

      // Sentence count (approximate)
      const sentences = bodyText.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const sentenceCount = Math.max(1, sentences.length); // Minimum 1

      // Paragraph count
      const paragraphCount = $('p').length;

      // Average words per sentence
      const averageWordsPerSentence = Math.round(wordCount / sentenceCount);

    // Syllable count (approximate for English)
    const countSyllables = (word: string): number => {
      try {
        word = word.toLowerCase().replace(/[^a-z]/g, '');
        if (word.length === 0) return 1; // Empty word
        if (word.length <= 3) return 1;
        const vowels = word.match(/[aeiouy]+/g);
        let syllables = vowels ? vowels.length : 1;
        if (word.endsWith('e')) syllables--;
        if (word.endsWith('le') && word.length > 2) syllables++;
        return Math.max(1, syllables);
      } catch (e) {
        return 1; // Fallback on error
      }
    };

    const totalSyllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
    const syllablesPerWord = wordCount > 0 ? totalSyllables / wordCount : 1;

      // Flesch Reading Ease Score
      // Formula: 206.835 - 1.015 × (words/sentences) - 84.6 × (syllables/words)
      const readabilityScore = Math.round(
        206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * syllablesPerWord
      );

      // Determine readability level
      let readabilityLevel: 'very-easy' | 'easy' | 'moderate' | 'difficult' | 'very-difficult';
      if (readabilityScore >= 80) readabilityLevel = 'very-easy';
      else if (readabilityScore >= 60) readabilityLevel = 'easy';
      else if (readabilityScore >= 40) readabilityLevel = 'moderate';
      else if (readabilityScore >= 20) readabilityLevel = 'difficult';
      else readabilityLevel = 'very-difficult';

      return {
        wordCount,
        paragraphCount,
        sentenceCount,
        readabilityScore: Math.max(0, Math.min(100, readabilityScore)),
        readabilityLevel,
        averageWordsPerSentence,
      };
    } catch (error: any) {
      // Fallback on error
      console.error('Content analysis error:', error);
      return {
        wordCount: 0,
        paragraphCount: 0,
        sentenceCount: 0,
        readabilityScore: 50,
        readabilityLevel: 'moderate',
        averageWordsPerSentence: 0,
      };
    }
  }

  // Technology Detection
  analyzeTechnology(): WebAnalysisTechnology {
    if (!this.$) throw new Error('No HTML loaded');

    const $ = this.$;
    const htmlLower = this.html.toLowerCase();

    const libraries: string[] = [];
    const analytics: string[] = [];
    const fonts: string[] = [];
    const cdns: string[] = [];

    let platform: string | null = null;
    let framework: string | null = null;
    let server: string | null = null;

    // CMS/Platform Detection
    if (htmlLower.includes('wp-content') || htmlLower.includes('wordpress')) {
      platform = 'WordPress';
    } else if (htmlLower.includes('shopify')) {
      platform = 'Shopify';
    } else if (htmlLower.includes('wix.com')) {
      platform = 'Wix';
    } else if (htmlLower.includes('squarespace')) {
      platform = 'Squarespace';
    } else if (htmlLower.includes('_next') || $('script[src*="/_next/"]').length > 0) {
      platform = 'Next.js';
    } else if ($('meta[name="generator"]').attr('content')?.includes('Webflow')) {
      platform = 'Webflow';
    }

    // Framework Detection
    if ($('[data-reactroot]').length > 0 || $('[data-react]').length > 0 || htmlLower.includes('react')) {
      framework = 'React';
    } else if ($('[data-v-]').length > 0 || htmlLower.includes('vue.js')) {
      framework = 'Vue.js';
    } else if ($('[ng-version]').length > 0 || htmlLower.includes('angular')) {
      framework = 'Angular';
    }

    // Libraries
    if (htmlLower.includes('jquery')) libraries.push('jQuery');
    if (htmlLower.includes('bootstrap')) libraries.push('Bootstrap');
    if (htmlLower.includes('tailwind')) libraries.push('Tailwind CSS');
    if (htmlLower.includes('lodash')) libraries.push('Lodash');
    if (htmlLower.includes('gsap')) libraries.push('GSAP');
    if (htmlLower.includes('swiper')) libraries.push('Swiper');

    // Analytics & Marketing
    if (htmlLower.includes('google-analytics') || htmlLower.includes('gtag')) {
      analytics.push('Google Analytics');
    }
    if (htmlLower.includes('googletagmanager')) {
      analytics.push('Google Tag Manager');
    }
    if (htmlLower.includes('facebook.net/en_us/fbevents.js')) {
      analytics.push('Facebook Pixel');
    }
    if (htmlLower.includes('hotjar')) {
      analytics.push('Hotjar');
    }

    // Fonts
    if (htmlLower.includes('fonts.googleapis.com')) {
      fonts.push('Google Fonts');
    }
    if (htmlLower.includes('use.typekit.net')) {
      fonts.push('Adobe Fonts');
    }

    // CDNs
    if (htmlLower.includes('cloudflare')) cdns.push('Cloudflare');
    if (htmlLower.includes('jsdelivr')) cdns.push('jsDelivr');
    if (htmlLower.includes('unpkg')) cdns.push('unpkg');

    // Server Detection (from response headers)
    if (this.responseHeaders) {
      const serverHeader = this.responseHeaders.get('server');
      if (serverHeader) {
        server = serverHeader;
      }
    }

    return {
      platform,
      framework,
      libraries,
      analytics,
      server,
      fonts,
      cdns,
    };
  }

  // Security Analysis
  analyzeSecurity(): WebAnalysisSecurity {
    const headers = this.responseHeaders;

    const securityHeaders = {
      strictTransportSecurity: false,
      contentSecurityPolicy: false,
      xFrameOptions: false,
      xContentTypeOptions: false,
      referrerPolicy: false,
    };

    let score = 100;

    if (headers) {
      securityHeaders.strictTransportSecurity = headers.has('strict-transport-security');
      securityHeaders.contentSecurityPolicy = headers.has('content-security-policy');
      securityHeaders.xFrameOptions = headers.has('x-frame-options');
      securityHeaders.xContentTypeOptions = headers.has('x-content-type-options');
      securityHeaders.referrerPolicy = headers.has('referrer-policy');

      // Deduct points for missing headers
      if (!securityHeaders.strictTransportSecurity) score -= 20;
      if (!securityHeaders.contentSecurityPolicy) score -= 20;
      if (!securityHeaders.xFrameOptions) score -= 15;
      if (!securityHeaders.xContentTypeOptions) score -= 10;
      if (!securityHeaders.referrerPolicy) score -= 10;
    } else {
      score = 0;
    }

    // Check for mixed content (http resources on https page)
    const mixedContent = this.url.startsWith('https://') &&
      this.html.includes('http://') &&
      !this.html.match(/http:\/\/localhost/);

    // Check HTTPS redirect
    const httpsRedirect = this.url.startsWith('https://');

    return {
      securityScore: Math.max(0, score),
      headers: securityHeaders,
      mixedContent: !!mixedContent,
      httpsRedirect,
    };
  }

  // Performance Analysis (basic estimation)
  analyzePerformance(): WebAnalysisPerformance {
    if (!this.$) throw new Error('No HTML loaded');

    const $ = this.$;

    // Count resources
    const scripts = $('script[src]').length;
    const stylesheets = $('link[rel="stylesheet"]').length;
    const images = $('img[src]').length;
    const totalResources = scripts + stylesheets + images;

    // Estimate size (very rough approximation)
    const htmlSize = this.html.length / 1024; // KB
    const estimatedResourcesSize = Math.round(
      htmlSize +
      scripts * 50 + // avg 50KB per script
      stylesheets * 30 + // avg 30KB per stylesheet
      images * 100 // avg 100KB per image
    );

    // Check for compression
    const hasCompression = this.responseHeaders?.has('content-encoding') || false;

    // Check for caching
    const hasCaching = this.responseHeaders?.has('cache-control') || false;

    // Count large images (those with "width" or "height" attributes suggesting large size)
    let largeImages = 0;
    $('img').each((_, el) => {
      const width = $(el).attr('width');
      const height = $(el).attr('height');
      if ((width && parseInt(width) > 1000) || (height && parseInt(height) > 1000)) {
        largeImages++;
      }
    });

    // Calculate estimated performance score
    let score = 100;
    if (totalResources > 50) score -= 20;
    else if (totalResources > 30) score -= 10;

    if (estimatedResourcesSize > 3000) score -= 30;
    else if (estimatedResourcesSize > 2000) score -= 20;
    else if (estimatedResourcesSize > 1000) score -= 10;

    if (!hasCompression) score -= 15;
    if (!hasCaching) score -= 10;
    if (largeImages > 5) score -= 15;
    else if (largeImages > 0) score -= 5;

    return {
      estimatedScore: Math.max(0, Math.min(100, score)),
      totalResourcesSize: estimatedResourcesSize,
      totalResources,
      hasCompression,
      hasCaching,
      largeImages,
    };
  }

  async analyze(): Promise<WebAnalysisResult> {
    const startTime = Date.now();

    // Fetch website
    await this.fetchWebsite();

    // Analyze technical aspects
    const technical = this.analyzeTechnical();

    // NEW: Run extended analysis
    const content = this.analyzeContent();
    const technology = this.analyzeTechnology();
    const security = this.analyzeSecurity();
    const performance = this.analyzePerformance();

    // Check sitemap and robots.txt
    const [hasSitemap, hasRobotsTxt] = await Promise.all([
      this.checkSitemap(),
      this.checkRobotsTxt()
    ]);

    technical.hasSitemap = hasSitemap;
    technical.hasRobotsTxt = hasRobotsTxt;
    technical.loadTime = Date.now() - startTime;

    // Identify issues (now with extended data)
    const issues = this.identifyIssues(technical, content, security, performance);

    // Calculate score
    const overallScore = this.calculateScore(issues);

    // Get package recommendation
    const recommendation = this.recommendPackage(technical, issues, overallScore);

    // Count issues by category
    const issueCount = {
      critical: issues.filter(i => i.category === 'critical').length,
      warning: issues.filter(i => i.category === 'warning').length,
      info: issues.filter(i => i.category === 'info').length,
    };

    return {
      url: this.url,
      analyzedAt: new Date(),
      technical,
      content,
      technology,
      security,
      performance,
      issues,
      issueCount,
      overallScore,
      recommendation,
      emailSent: false,
      status: 'analyzed',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

// Helper function for API routes
export async function analyzeWebsite(url: string): Promise<WebAnalysisResult> {
  const analyzer = new WebAnalyzer(url);
  return await analyzer.analyze();
}
