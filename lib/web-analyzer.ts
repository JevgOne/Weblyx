import * as cheerio from 'cheerio';
import {
  WebAnalysisTechnical,
  WebAnalysisIssue,
  PackageRecommendation,
  WebAnalysisResult,
  WebAnalysisContent,
  WebAnalysisTechnology,
  WebAnalysisSecurity,
  WebAnalysisPerformance,
  WebAnalysisOpenGraph,
  WebAnalysisAccessibility,
  WebAnalysisGeo,
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

    // Canonical URL
    const canonicalUrl = $('link[rel="canonical"]').attr('href') || null;
    const hasCanonical = !!canonicalUrl;

    // Hreflang tags
    const hreflangTags: string[] = [];
    $('link[rel="alternate"][hreflang]').each((_, el) => {
      const lang = $(el).attr('hreflang');
      if (lang) hreflangTags.push(lang);
    });

    // Robots meta
    const robotsMeta = $('meta[name="robots"]').attr('content') || null;

    // Title and description lengths
    const titleLength = title ? title.length : 0;
    const descriptionLength = description ? description.length : 0;

    // Text/HTML ratio
    const bodyText = $('body').clone().find('script, style').remove().end().text().trim();
    const textHtmlRatio = this.html.length > 0
      ? Math.round((bodyText.length / this.html.length) * 10000) / 100
      : 0;

    // Keyword density (top 10 words, min 4 chars, ignore stop words)
    const stopWords = new Set([
      'that', 'this', 'with', 'from', 'have', 'been', 'will', 'your', 'they',
      'their', 'what', 'when', 'where', 'which', 'there', 'about', 'more',
      'some', 'than', 'them', 'into', 'other', 'could', 'would', 'make',
      'like', 'just', 'over', 'such', 'also', 'jsou', 'nebo', 'jako',
      'jeho', 'bylo', 'které', 'není', 'může', 'bude', 'jsme', 'máme',
      'vaše', 'naše', 'toho', 'tato', 'tyto', 'přes', 'pouze', 'každý',
    ]);
    const words = bodyText.toLowerCase().split(/\s+/).filter(w => w.length >= 4 && !stopWords.has(w));
    const wordFreq: Record<string, number> = {};
    words.forEach(w => { wordFreq[w] = (wordFreq[w] || 0) + 1; });
    const totalWords = words.length || 1;
    const keywordDensity = Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word, count]) => ({
        word,
        count,
        percentage: Math.round((count / totalWords) * 10000) / 100,
      }));

    // Structured data types from JSON-LD
    const structuredDataTypes: string[] = [];
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const json = JSON.parse($(el).html() || '{}');
        const extractTypes = (obj: any) => {
          if (obj['@type']) {
            const types = Array.isArray(obj['@type']) ? obj['@type'] : [obj['@type']];
            types.forEach((t: string) => { if (!structuredDataTypes.includes(t)) structuredDataTypes.push(t); });
          }
          if (obj['@graph'] && Array.isArray(obj['@graph'])) {
            obj['@graph'].forEach(extractTypes);
          }
        };
        extractTypes(json);
      } catch { /* ignore parse errors */ }
    });

    // Heading hierarchy validation
    const headingLevels: number[] = [];
    $('h1, h2, h3, h4, h5, h6').each((_, el) => {
      headingLevels.push(parseInt(el.tagName[1]));
    });
    let headingHierarchyValid = true;
    if (headingLevels.length > 0 && headingLevels[0] !== 1) {
      headingHierarchyValid = false;
    }
    for (let i = 1; i < headingLevels.length; i++) {
      if (headingLevels[i] > headingLevels[i - 1] + 1) {
        headingHierarchyValid = false;
        break;
      }
    }

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
      canonicalUrl,
      hasCanonical,
      hreflangTags,
      robotsMeta,
      titleLength,
      descriptionLength,
      textHtmlRatio,
      keywordDensity,
      structuredDataTypes,
      headingHierarchyValid,
    } as WebAnalysisTechnical;
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

  analyzeOpenGraph(): WebAnalysisOpenGraph {
    if (!this.$) throw new Error('No HTML loaded');
    const $ = this.$;

    // OG tags
    const ogTitle = $('meta[property="og:title"]').attr('content') || null;
    const ogDescription = $('meta[property="og:description"]').attr('content') || null;
    const ogImage = $('meta[property="og:image"]').attr('content') || null;
    const ogType = $('meta[property="og:type"]').attr('content') || null;
    const ogUrl = $('meta[property="og:url"]').attr('content') || null;
    const ogSiteName = $('meta[property="og:site_name"]').attr('content') || null;

    // Twitter Card tags
    const twitterCard = $('meta[name="twitter:card"]').attr('content') || null;
    const twitterTitle = $('meta[name="twitter:title"]').attr('content') || null;
    const twitterDescription = $('meta[name="twitter:description"]').attr('content') || null;
    const twitterImage = $('meta[name="twitter:image"]').attr('content') || null;

    // Social links - scan all <a> tags
    const socialLinks: WebAnalysisOpenGraph['socialLinks'] = {
      facebook: null, instagram: null, linkedin: null,
      twitter: null, youtube: null, tiktok: null,
    };

    $('a[href]').each((_, el) => {
      const href = $(el).attr('href') || '';
      if (href.includes('facebook.com')) socialLinks.facebook = href;
      else if (href.includes('instagram.com')) socialLinks.instagram = href;
      else if (href.includes('linkedin.com')) socialLinks.linkedin = href;
      else if (href.includes('twitter.com') || href.includes('x.com')) socialLinks.twitter = href;
      else if (href.includes('youtube.com')) socialLinks.youtube = href;
      else if (href.includes('tiktok.com')) socialLinks.tiktok = href;
    });

    // Scoring
    let socialScore = 0;
    if (ogTitle) socialScore += 15;
    if (ogDescription) socialScore += 15;
    if (ogImage) socialScore += 15;
    if (twitterCard) socialScore += 10;
    if (ogType) socialScore += 5;
    if (ogUrl) socialScore += 5;
    if (twitterImage) socialScore += 5;
    // Social links: up to 20 points (max ~3.3 per link)
    const socialLinkCount = Object.values(socialLinks).filter(Boolean).length;
    socialScore += Math.min(20, Math.round(socialLinkCount * 3.3));
    // OG image valid (has image URL starting with http)
    if (ogImage && ogImage.startsWith('http')) socialScore += 10;

    return {
      ogTitle, ogDescription, ogImage, ogType, ogUrl, ogSiteName,
      twitterCard, twitterTitle, twitterDescription, twitterImage,
      socialLinks,
      socialScore: Math.min(100, socialScore),
    };
  }

  analyzeAccessibility(): WebAnalysisAccessibility {
    if (!this.$) throw new Error('No HTML loaded');
    const $ = this.$;
    const issues: string[] = [];

    // HTML lang attribute
    const htmlLangAttribute = $('html').attr('lang') || null;
    if (!htmlLangAttribute) issues.push('Chybí lang atribut na <html>');

    // Skip navigation
    const hasSkipNavigation = $('a[href="#main"], a[href="#content"], a.skip-link, a.skip-nav, [class*="skip"]').length > 0;

    // ARIA labels and landmarks
    const ariaLabelsCount = $('[aria-label], [aria-labelledby]').length;
    const ariaLandmarksCount = $('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], main, nav, header, footer, aside').length;

    // Form labels
    const formInputsTotal = $('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select').length;
    const formLabelsAssociated = $('label[for]').length;
    if (formInputsTotal > 0 && formLabelsAssociated < formInputsTotal) {
      issues.push(`${formInputsTotal - formLabelsAssociated} formulářových polí bez přiřazeného labelu`);
    }

    // Empty links (no text, no aria-label, no image with alt)
    let emptyLinksCount = 0;
    $('a').each((_, el) => {
      const text = $(el).text().trim();
      const ariaLabel = $(el).attr('aria-label');
      const hasImg = $(el).find('img[alt]').length > 0;
      if (!text && !ariaLabel && !hasImg) emptyLinksCount++;
    });
    if (emptyLinksCount > 0) issues.push(`${emptyLinksCount} prázdných odkazů bez textu`);

    // Empty buttons
    let emptyButtonsCount = 0;
    $('button').each((_, el) => {
      const text = $(el).text().trim();
      const ariaLabel = $(el).attr('aria-label');
      if (!text && !ariaLabel) emptyButtonsCount++;
    });
    if (emptyButtonsCount > 0) issues.push(`${emptyButtonsCount} prázdných tlačítek bez textu`);

    // Tabindex usage
    const tabindexUsage = $('[tabindex]').length;

    // Heading hierarchy
    const headingLevels: number[] = [];
    $('h1, h2, h3, h4, h5, h6').each((_, el) => {
      headingLevels.push(parseInt(el.tagName[1]));
    });
    let headingHierarchyValid = true;
    if (headingLevels.length > 0 && headingLevels[0] !== 1) headingHierarchyValid = false;
    for (let i = 1; i < headingLevels.length; i++) {
      if (headingLevels[i] > headingLevels[i - 1] + 1) { headingHierarchyValid = false; break; }
    }
    if (!headingHierarchyValid) issues.push('Nesprávná hierarchie nadpisů (přeskočené úrovně)');

    // Scoring
    let score = 0;
    if (htmlLangAttribute) score += 15;
    if (hasSkipNavigation) score += 10;
    if (ariaLabelsCount > 0) score += 10;
    if (ariaLandmarksCount >= 2) score += 10;
    if (formInputsTotal === 0 || formLabelsAssociated >= formInputsTotal) score += 15;
    else if (formLabelsAssociated > 0) score += 7;
    if (emptyLinksCount === 0) score += 10;
    if (emptyButtonsCount === 0) score += 10;
    if (headingHierarchyValid) score += 10;
    // Alt texts (check from total images)
    const totalImages = $('img').length;
    const imagesWithAlt = $('img[alt]').filter((_, el) => ($(el).attr('alt') || '').trim().length > 0).length;
    if (totalImages === 0 || imagesWithAlt >= totalImages) score += 10;
    else if (imagesWithAlt > totalImages * 0.5) score += 5;

    return {
      accessibilityScore: Math.min(100, score),
      htmlLangAttribute,
      hasSkipNavigation,
      ariaLabelsCount,
      ariaLandmarksCount,
      formLabelsAssociated,
      formInputsTotal,
      emptyLinksCount,
      emptyButtonsCount,
      tabindexUsage,
      headingHierarchyValid,
      issues,
    };
  }

  analyzeGeo(): WebAnalysisGeo {
    if (!this.$) throw new Error('No HTML loaded');
    const $ = this.$;
    const bodyText = $('body').text();
    const lowerHtml = this.html.toLowerCase();

    // FAQ detection
    const hasFaqSection = $('.faq, #faq, [class*="faq"], details > summary, [class*="accordion"], [class*="FAQ"]').length > 0;
    const hasQaFormat = $('details > summary').length > 0 || $('[itemtype*="FAQPage"]').length > 0;

    // Schema types from JSON-LD
    const schemaTypes: string[] = [];
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const json = JSON.parse($(el).html() || '{}');
        const extractTypes = (obj: any) => {
          if (obj['@type']) {
            const types = Array.isArray(obj['@type']) ? obj['@type'] : [obj['@type']];
            types.forEach((t: string) => { if (!schemaTypes.includes(t)) schemaTypes.push(t); });
          }
          if (obj['@graph'] && Array.isArray(obj['@graph'])) obj['@graph'].forEach(extractTypes);
        };
        extractTypes(json);
      } catch { /* ignore */ }
    });

    const hasLocalBusinessSchema = schemaTypes.some(t => t.includes('LocalBusiness') || t.includes('Restaurant') || t.includes('Store'));
    const hasOrganizationSchema = schemaTypes.includes('Organization');
    const hasProductSchema = schemaTypes.includes('Product');
    const hasBreadcrumbSchema = schemaTypes.includes('BreadcrumbList');

    // Content freshness
    const copyrightMatch = bodyText.match(/©\s*(\d{4})/);
    const copyrightYear = copyrightMatch ? parseInt(copyrightMatch[1]) : null;
    const hasDatePublished = $('[itemprop="datePublished"], time[datetime], meta[property="article:published_time"]').length > 0;
    let latestDateFound: string | null = null;
    $('time[datetime]').each((_, el) => {
      const dt = $(el).attr('datetime');
      if (dt && (!latestDateFound || dt > latestDateFound)) latestDateFound = dt;
    });

    // Business info detection
    const hasAddress = /\b\d{3}\s?\d{2}\b/.test(bodyText) || lowerHtml.includes('address') || $('[itemprop="address"], [itemtype*="PostalAddress"]').length > 0;
    const hasPhone = /(\+?\d{3}[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3}|\+?\d{3}[\s-]?\d{2}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2})/.test(bodyText) || $('a[href^="tel:"]').length > 0;
    const hasEmail = $('a[href^="mailto:"]').length > 0 || /[\w.-]+@[\w.-]+\.\w{2,}/.test(bodyText);
    const hasOpeningHours = lowerHtml.includes('otevírací') || lowerHtml.includes('opening') || lowerHtml.includes('öffnungszeiten') || $('[itemprop="openingHours"]').length > 0;
    const hasPricing = lowerHtml.includes('ceník') || lowerHtml.includes('cena') || lowerHtml.includes('price') || lowerHtml.includes('preis') || /\d+[\s,.]?\d*\s*(kč|czk|€|eur)/i.test(bodyText);

    // About/Contact pages
    const hasAboutPage = $('a[href*="about"], a[href*="o-nas"], a[href*="uber-uns"]').length > 0;
    const hasContactPage = $('a[href*="contact"], a[href*="kontakt"]').length > 0;

    // Natural language score (basic - presence of long-form content)
    const paragraphs = $('p').filter((_, el) => $(el).text().trim().length > 50).length;
    const naturalLanguageScore = Math.min(100, paragraphs * 10);

    // Scoring
    let geoScore = 0;
    if (hasFaqSection) geoScore += 15;
    if (hasLocalBusinessSchema) geoScore += 15;
    else if (schemaTypes.length > 0) geoScore += 10;
    if (hasAddress) geoScore += 8;
    if (hasPhone) geoScore += 5;
    if (hasEmail) geoScore += 5;
    if (hasOpeningHours) geoScore += 5;
    if (hasPricing) geoScore += 5;
    // Freshness: copyright year within last 2 years
    const currentYear = new Date().getFullYear();
    if (copyrightYear && copyrightYear >= currentYear - 1) geoScore += 10;
    else if (hasDatePublished) geoScore += 5;
    if (hasAboutPage) geoScore += 5;
    if (hasContactPage) geoScore += 5;
    // Bonus for multiple schema types
    if (hasOrganizationSchema) geoScore += 5;
    if (hasBreadcrumbSchema) geoScore += 5;
    if (hasProductSchema) geoScore += 5;

    return {
      geoScore: Math.min(100, geoScore),
      hasFaqSection,
      hasQaFormat,
      schemaTypes,
      hasLocalBusinessSchema,
      hasOrganizationSchema,
      hasProductSchema,
      hasBreadcrumbSchema,
      contentFreshness: { copyrightYear, hasDatePublished, latestDateFound },
      businessInfo: { hasAddress, hasPhone, hasEmail, hasOpeningHours, hasPricing },
      hasAboutPage,
      hasContactPage,
      naturalLanguageScore,
    };
  }

  calculateCategoryScores(
    technical: WebAnalysisTechnical,
    performance?: WebAnalysisPerformance,
    security?: WebAnalysisSecurity,
    accessibility?: WebAnalysisAccessibility,
    openGraph?: WebAnalysisOpenGraph,
    geo?: WebAnalysisGeo,
  ): { seo: number; performance: number; security: number; accessibility: number; social: number; geo: number } {
    // SEO score based on technical fields
    let seo = 0;
    if (technical.title) seo += 15;
    if (technical.description) seo += 15;
    if (technical.hasCanonical) seo += 10;
    if (technical.hasH1 && technical.h1Count === 1) seo += 10;
    if (technical.headingHierarchyValid) seo += 5;
    if (technical.schemaMarkup) seo += 10;
    if (technical.hasSitemap) seo += 10;
    if (technical.hasRobotsTxt) seo += 5;
    if (technical.mobileResponsive) seo += 10;
    if (technical.imagesWithoutAlt === 0 && technical.totalImages > 0) seo += 5;
    else if (technical.totalImages === 0) seo += 5;
    if ((technical.titleLength || 0) >= 30 && (technical.titleLength || 0) <= 60) seo += 5;

    return {
      seo: Math.min(100, seo),
      performance: performance?.estimatedScore || 0,
      security: security?.securityScore || 0,
      accessibility: accessibility?.accessibilityScore || 0,
      social: openGraph?.socialScore || 0,
      geo: geo?.geoScore || 0,
    };
  }

  identifyIssues(
    technical: WebAnalysisTechnical,
    content?: WebAnalysisContent,
    security?: WebAnalysisSecurity,
    performance?: WebAnalysisPerformance,
    openGraph?: WebAnalysisOpenGraph,
    accessibility?: WebAnalysisAccessibility,
    geo?: WebAnalysisGeo,
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

    // Extended SEO issues
    if (technical.titleLength && technical.titleLength > 60) {
      issues.push({
        category: 'warning',
        title: 'Title tag je příliš dlouhý',
        description: `Title má ${technical.titleLength} znaků (doporučeno 50-60)`,
        impact: 'Google ořízne title ve výsledcích vyhledávání',
        recommendation: 'Zkrátit title tag na 50-60 znaků'
      });
    } else if (technical.title && technical.titleLength && technical.titleLength < 30) {
      issues.push({
        category: 'info',
        title: 'Title tag je příliš krátký',
        description: `Title má pouze ${technical.titleLength} znaků (doporučeno 50-60)`,
        impact: 'Nevyužitý prostor ve výsledcích vyhledávání',
        recommendation: 'Rozšířit title tag na 50-60 znaků s klíčovými slovy'
      });
    }

    if (technical.description && technical.descriptionLength && technical.descriptionLength > 160) {
      issues.push({
        category: 'info',
        title: 'Meta description je příliš dlouhý',
        description: `Description má ${technical.descriptionLength} znaků (doporučeno 150-160)`,
        impact: 'Google ořízne popis ve výsledcích',
        recommendation: 'Zkrátit meta description na 150-160 znaků'
      });
    }

    if (!technical.hasCanonical) {
      issues.push({
        category: 'warning',
        title: 'Chybí canonical tag',
        description: 'Stránka nemá definovanou kanonickou URL',
        impact: 'Riziko duplicitního obsahu v indexu Google',
        recommendation: 'Přidat <link rel="canonical"> tag'
      });
    }

    if (technical.textHtmlRatio !== undefined && technical.textHtmlRatio < 10) {
      issues.push({
        category: 'info',
        title: 'Nízký poměr textu k HTML',
        description: `Poměr textu k HTML kódu je pouze ${technical.textHtmlRatio}%`,
        impact: 'Může indikovat přebytek kódu nebo nedostatek obsahu',
        recommendation: 'Zvýšit poměr textového obsahu k HTML kódu'
      });
    }

    if (technical.headingHierarchyValid === false) {
      issues.push({
        category: 'warning',
        title: 'Nesprávná hierarchie nadpisů',
        description: 'Nadpisy přeskakují úrovně (např. H1 → H3)',
        impact: 'Horší srozumitelnost pro vyhledávače a screen readery',
        recommendation: 'Dodržovat hierarchii H1 → H2 → H3 bez přeskakování'
      });
    }

    // OpenGraph issues
    if (openGraph) {
      if (!openGraph.ogTitle || !openGraph.ogDescription || !openGraph.ogImage) {
        issues.push({
          category: 'warning',
          title: 'Neúplné Open Graph tagy',
          description: `Chybí: ${[
            !openGraph.ogTitle && 'og:title',
            !openGraph.ogDescription && 'og:description',
            !openGraph.ogImage && 'og:image',
          ].filter(Boolean).join(', ')}`,
          impact: 'Špatný náhled při sdílení na sociálních sítích',
          recommendation: 'Přidat kompletní Open Graph meta tagy (title, description, image)'
        });
      }

      if (!openGraph.twitterCard) {
        issues.push({
          category: 'info',
          title: 'Chybí Twitter Card meta tagy',
          description: 'Stránka nemá definované Twitter Card tagy',
          impact: 'Horší náhled při sdílení na Twitter/X',
          recommendation: 'Přidat Twitter Card meta tagy (twitter:card, twitter:title, twitter:image)'
        });
      }

      const socialLinkCount = Object.values(openGraph.socialLinks).filter(Boolean).length;
      if (socialLinkCount === 0) {
        issues.push({
          category: 'info',
          title: 'Žádné odkazy na sociální sítě',
          description: 'Na webu nejsou odkazy na profily sociálních sítí',
          impact: 'Snížená důvěryhodnost a propojení se zákazníky',
          recommendation: 'Přidat odkazy na firemní profily na sociálních sítích'
        });
      }
    }

    // Accessibility issues
    if (accessibility) {
      if (!accessibility.htmlLangAttribute) {
        issues.push({
          category: 'warning',
          title: 'Chybí lang atribut',
          description: 'HTML element nemá definovaný jazyk stránky',
          impact: 'Screen readery nemohou správně číst obsah',
          recommendation: 'Přidat atribut lang="cs" na <html> element'
        });
      }

      if (accessibility.emptyLinksCount > 0) {
        issues.push({
          category: 'warning',
          title: 'Prázdné odkazy bez textu',
          description: `${accessibility.emptyLinksCount} odkazů nemá žádný text ani aria-label`,
          impact: 'Nepřístupné pro screen readery a uživatele klávesnice',
          recommendation: 'Přidat text nebo aria-label ke všem odkazům'
        });
      }

      if (accessibility.emptyButtonsCount > 0) {
        issues.push({
          category: 'warning',
          title: 'Prázdná tlačítka bez textu',
          description: `${accessibility.emptyButtonsCount} tlačítek nemá žádný text ani aria-label`,
          impact: 'Nepřístupné pro uživatele s asistenčními technologiemi',
          recommendation: 'Přidat text nebo aria-label ke všem tlačítkům'
        });
      }
    }

    // GEO/AIEO issues
    if (geo) {
      if (!geo.hasFaqSection) {
        issues.push({
          category: 'info',
          title: 'Chybí FAQ sekce',
          description: 'Web nemá sekci s často kladenými otázkami',
          impact: 'Ztracená příležitost pro featured snippets a AI odpovědi',
          recommendation: 'Přidat FAQ sekci s relevantními otázkami a odpověďmi'
        });
      }

      if (geo.schemaTypes.length === 0) {
        issues.push({
          category: 'warning',
          title: 'Žádná strukturovaná data (JSON-LD)',
          description: 'Web nepoužívá žádné schema.org strukturované data',
          impact: 'Ztracená příležitost pro rich snippets a lepší viditelnost',
          recommendation: 'Implementovat JSON-LD schema (Organization, LocalBusiness, FAQPage)'
        });
      }

      if (geo.contentFreshness.copyrightYear && geo.contentFreshness.copyrightYear < new Date().getFullYear() - 2) {
        issues.push({
          category: 'warning',
          title: 'Zastaralý obsah',
          description: `Copyright rok: ${geo.contentFreshness.copyrightYear}`,
          impact: 'Signalizuje zastaralost webu pro vyhledávače',
          recommendation: 'Aktualizovat copyright rok a datum obsahu'
        });
      }

      if (!geo.businessInfo.hasAddress && !geo.businessInfo.hasPhone) {
        issues.push({
          category: 'info',
          title: 'Chybí kontaktní údaje firmy',
          description: 'Na webu chybí adresa a telefonní číslo',
          impact: 'Snížená důvěryhodnost a lokální SEO',
          recommendation: 'Přidat viditelné kontaktní údaje (adresa, telefon, email)'
        });
      }
    }

    return issues;
  }

  calculateScore(
    issues: WebAnalysisIssue[],
    categoryScores?: { seo: number; performance: number; security: number; accessibility: number; social: number; geo: number }
  ): number {
    if (categoryScores) {
      // Weighted average: SEO 25% + Performance 20% + Security 10% + Accessibility 15% + Social 15% + GEO 15%
      return Math.round(
        categoryScores.seo * 0.25 +
        categoryScores.performance * 0.20 +
        categoryScores.security * 0.10 +
        categoryScores.accessibility * 0.15 +
        categoryScores.social * 0.15 +
        categoryScores.geo * 0.15
      );
    }

    // Fallback: issue-based scoring
    let score = 100;
    issues.forEach(issue => {
      if (issue.category === 'critical') score -= 15;
      else if (issue.category === 'warning') score -= 8;
      else score -= 3;
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
        packageId: 'premium',
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
          packageId: 'premium',
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
        packageId: 'standard',
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
          packageId: 'standard',
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
        packageId: 'start',
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
          packageId: 'start',
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
        packageId: 'standard',
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
      packageId: 'start',
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

      // Top keywords extraction (word frequency analysis)
      const stopWords = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','shall','can','this','that','these','those','it','its','i','you','he','she','we','they','me','him','her','us','them','my','your','his','our','their','what','which','who','whom','where','when','how','not','no','nor','if','then','than','too','very','just','about','up','out','so','as','all','each','every','both','few','more','most','other','some','such','only','own','same','also','back','even','still','new','old','je','na','se','v','a','s','z','do','o','pro','za','k','po','od','ale','jak','co','si','to','ten','ta','ty','jsem','jsou','byl','být','má','že','aby','tak','nebo','ani','už','jen','při','ke','ze','ve','kde','ve','jako','než','podle','i','nad','pod','mezi']);
      const wordFreq = new Map<string, number>();
      for (const w of words) {
        const lower = w.toLowerCase().replace(/[^a-záčďéěíňóřšťúůýž\w]/gi, '');
        if (lower.length >= 3 && !stopWords.has(lower) && !/^\d+$/.test(lower)) {
          wordFreq.set(lower, (wordFreq.get(lower) || 0) + 1);
        }
      }
      const topKeywords = [...wordFreq.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([word, count]) => ({ word, count }));

      return {
        wordCount,
        paragraphCount,
        sentenceCount,
        readabilityScore: Math.max(0, Math.min(100, readabilityScore)),
        readabilityLevel,
        averageWordsPerSentence,
        topKeywords,
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
        topKeywords: [],
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

    // Analyze all aspects
    const technical = this.analyzeTechnical();
    const content = this.analyzeContent();
    const technology = this.analyzeTechnology();
    const security = this.analyzeSecurity();
    const performance = this.analyzePerformance();
    const openGraph = this.analyzeOpenGraph();
    const accessibility = this.analyzeAccessibility();
    const geo = this.analyzeGeo();

    // Check sitemap and robots.txt
    const [hasSitemap, hasRobotsTxt] = await Promise.all([
      this.checkSitemap(),
      this.checkRobotsTxt()
    ]);

    technical.hasSitemap = hasSitemap;
    technical.hasRobotsTxt = hasRobotsTxt;
    technical.loadTime = Date.now() - startTime;

    // Calculate category scores
    const categoryScores = this.calculateCategoryScores(
      technical, performance, security, accessibility, openGraph, geo
    );

    // Identify issues (with all data)
    const issues = this.identifyIssues(technical, content, security, performance, openGraph, accessibility, geo);

    // Calculate weighted overall score
    const overallScore = this.calculateScore(issues, categoryScores);

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
      openGraph,
      accessibility,
      geo,
      categoryScores,
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
