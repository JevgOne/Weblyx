import * as cheerio from 'cheerio';
import {
  WebAnalysisTechnical,
  WebAnalysisIssue,
  PackageRecommendation,
  WebAnalysisResult
} from '@/types/cms';

interface AnalyzeOptions {
  url: string;
  timeout?: number;
}

export class WebAnalyzer {
  private url: string;
  private html: string = '';
  private $: cheerio.CheerioAPI | null = null;

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
    } catch (error: any) {
      throw new Error(`Failed to fetch website: ${error.message}`);
    }
  }

  analyzeTechnical(): WebAnalysisTechnical {
    if (!this.$) throw new Error('No HTML loaded');

    const $ = this.$;

    // Meta tags
    const title = $('title').text() || undefined;
    const description = $('meta[name="description"]').attr('content') || undefined;
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

  identifyIssues(technical: WebAnalysisTechnical): WebAnalysisIssue[] {
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

    const needsSEO = !technical.title || !technical.description || !technical.hasH1;
    const needsRedesign = !technical.mobileResponsive || criticalCount > 2;
    const hasBasicSite = technical.hasSSL && technical.hasH1;

    // Enterprise - velké weby s velkými problémy nebo potřebou full redesignu
    if (criticalCount >= 4 || (criticalCount >= 2 && warningCount >= 3)) {
      return {
        packageId: 'premium',
        packageName: 'Premium Web',
        confidence: 85,
        reasoning: 'Váš web má vážné technické problémy a potřebuje komplexní redesign s důrazem na SEO a moderní technologie.',
        matchedNeeds: [
          'Oprava kritických SEO problémů',
          'Komplexní redesign',
          'Mobilní optimalizace',
          'Profesionální SEO setup'
        ]
      };
    }

    // Standard - střední weby se SEO problémy
    if (criticalCount >= 2 || (criticalCount >= 1 && warningCount >= 2)) {
      return {
        packageId: 'standard',
        packageName: 'Standard Web',
        confidence: 80,
        reasoning: 'Váš web má několik SEO a technických problémů, které je třeba vyřešit pro lepší výkon ve vyhledávačích.',
        matchedNeeds: [
          'SEO optimalizace',
          'Oprava technických chyb',
          'Responzivní design',
          'Základní schema markup'
        ]
      };
    }

    // Start - základní weby nebo menší úpravy
    if (hasBasicSite && criticalCount <= 1) {
      return {
        packageId: 'start',
        packageName: 'Start Web',
        confidence: 75,
        reasoning: 'Váš web má solidní základy, ale potřebuje drobné SEO úpravy a optimalizaci pro lepší výsledky.',
        matchedNeeds: [
          'SEO optimalizace',
          'Technické úpravy',
          'Optimalizace rychlosti'
        ]
      };
    }

    // Default fallback
    return {
      packageId: 'standard',
      packageName: 'Standard Web',
      confidence: 70,
      reasoning: 'Doporučujeme standardní balíček, který vyřeší vaše SEO problémy a zlepší celkový výkon webu.',
      matchedNeeds: [
        'SEO optimalizace',
        'Technické vylepšení',
        'Moderní design'
      ]
    };
  }

  async analyze(): Promise<WebAnalysisResult> {
    const startTime = Date.now();

    // Fetch website
    await this.fetchWebsite();

    // Analyze technical aspects
    const technical = this.analyzeTechnical();

    // Check sitemap and robots.txt
    const [hasSitemap, hasRobotsTxt] = await Promise.all([
      this.checkSitemap(),
      this.checkRobotsTxt()
    ]);

    technical.hasSitemap = hasSitemap;
    technical.hasRobotsTxt = hasRobotsTxt;
    technical.loadTime = Date.now() - startTime;

    // Identify issues
    const issues = this.identifyIssues(technical);

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
