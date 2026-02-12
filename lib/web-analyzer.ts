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

// Stop words for keyword extraction (CZ + EN)
const STOP_WORDS = new Set([
  // Czech
  'a', 'aby', 'aj', 'ale', 'ani', 'asi', 'az', 'bez', 'bude', 'budem', 'budes',
  'by', 'byl', 'byla', 'byli', 'bylo', 'byt', 'ci', 'clanek', 'co', 'com',
  'cz', 'da', 'do', 'ho', 'i', 'ja', 'jak', 'jako', 'je', 'jeho', 'jej',
  'jeji', 'jen', 'jeste', 'ji', 'jine', 'jiz', 'jsem', 'jsi', 'jsme', 'jsou',
  'jste', 'k', 'kam', 'kde', 'kdo', 'kdyz', 'ke', 'ktera', 'ktere', 'kteri',
  'kterou', 'ktery', 'ma', 'mate', 'me', 'mezi', 'mi', 'mit', 'mne', 'mnou',
  'muj', 'muze', 'my', 'na', 'nad', 'nam', 'nas', 'nase', 'ne', 'nebo',
  'necht', 'nei', 'nejaka', 'nejaky', 'nejakych', 'neni', 'nez', 'nic',
  'nich', 'nim', 'o', 'od', 'on', 'ona', 'oni', 'ono', 'pak', 'po', 'pod',
  'podle', 'pokud', 'pouze', 'prave', 'pred', 'pres', 'pri', 'pro', 'proc',
  'proto', 'protoze', 'prvni', 'pta', 're', 's', 'se', 'si', 'sice', 'sve',
  'svuj', 'ta', 'tak', 'take', 'takze', 'tato', 'te', 'ten', 'tedy', 'teto',
  'tim', 'to', 'tohle', 'toho', 'tom', 'tomto', 'toto', 'tu', 'tuto', 'ty',
  'tyto', 'u', 'uz', 'v', 'vam', 'vas', 'vase', 've', 'vice', 'vsak', 'vsechno',
  'vy', 'z', 'za', 'zda', 'zde', 'ze',
  // English
  'the', 'be', 'to', 'of', 'and', 'in', 'that', 'have', 'it', 'for', 'not',
  'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by',
  'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one',
  'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about',
  'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time',
  'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your',
  'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now',
  'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after',
  'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new',
  'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'are', 'is',
  'was', 'were', 'been', 'has', 'had', 'did', 'www', 'http', 'https',
]);

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
    const hostname = new URL(this.url).hostname;

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

    // Heading order for hierarchy check
    const headingOrder: string[] = [];
    $('h1, h2, h3, h4, h5, h6').each((_, el) => {
      headingOrder.push(el.tagName.toLowerCase());
    });

    // Canonical URL
    const canonicalUrl = $('link[rel="canonical"]').attr('href') || null;
    const hasCanonical = !!canonicalUrl;

    // Open Graph tags
    const ogTags = {
      title: $('meta[property="og:title"]').attr('content'),
      description: $('meta[property="og:description"]').attr('content'),
      image: $('meta[property="og:image"]').attr('content'),
      url: $('meta[property="og:url"]').attr('content'),
    };
    const hasOgTags = !!(ogTags.title || ogTags.description || ogTags.image);

    // Twitter Card tags
    const twitterCard = {
      card: $('meta[name="twitter:card"]').attr('content'),
      title: $('meta[name="twitter:title"]').attr('content'),
      description: $('meta[name="twitter:description"]').attr('content'),
      image: $('meta[name="twitter:image"]').attr('content'),
    };
    const hasTwitterCard = !!(twitterCard.card || twitterCard.title);

    // Hreflang tags
    const hreflangTags: string[] = [];
    $('link[rel="alternate"][hreflang]').each((_, el) => {
      const lang = $(el).attr('hreflang');
      if (lang) hreflangTags.push(lang);
    });

    // Favicon
    const hasFavicon = $('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').length > 0;

    // HTML lang attribute
    const htmlLang = $('html').attr('lang') || null;
    const hasLangAttribute = !!htmlLang;

    // DOM metrics
    const domElementCount = $('*').length;
    const inlineStyleCount = $('[style]').length;
    const pageSize = Math.round(this.html.length / 1024); // KB

    // Images
    const images = $('img');
    const totalImages = images.length;
    const imagesWithoutAlt = images.filter((_, el) => !$(el).attr('alt')).length;

    // Image optimization
    let imagesWithLazyLoading = 0;
    let imagesWithModernFormat = 0;
    images.each((_, el) => {
      const loading = $(el).attr('loading');
      if (loading === 'lazy') imagesWithLazyLoading++;
      const src = $(el).attr('src') || '';
      if (src.match(/\.(webp|avif)/i)) imagesWithModernFormat++;
    });
    // Also check <source> elements in <picture> for modern formats
    $('picture source').each((_, el) => {
      const type = $(el).attr('type') || '';
      if (type.includes('webp') || type.includes('avif')) imagesWithModernFormat++;
    });

    // Links
    const links = $('a[href]');
    let internalLinks = 0;
    let externalLinks = 0;

    links.each((_, el) => {
      const href = $(el).attr('href') || '';
      if (href.startsWith('http') && !href.includes(hostname)) {
        externalLinks++;
      } else if (!href.startsWith('http') || href.includes(hostname)) {
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
      canonicalUrl,
      hasCanonical,
      ogTags,
      hasOgTags,
      twitterCard,
      hasTwitterCard,
      hreflangTags,
      hasFavicon,
      htmlLang,
      hasLangAttribute,
      domElementCount,
      inlineStyleCount,
      pageSize,
      imagesWithLazyLoading,
      imagesWithModernFormat,
      headingOrder,
      brokenInternalLinks: [], // Filled by checkBrokenLinks()
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

  async checkBrokenLinks(): Promise<string[]> {
    if (!this.$) return [];

    const $ = this.$;
    const hostname = new URL(this.url).hostname;
    const brokenLinks: string[] = [];

    // Collect internal links (max 10 sampled)
    const internalUrls: string[] = [];
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href') || '';
      if (href.startsWith('/') || href.includes(hostname)) {
        try {
          const fullUrl = href.startsWith('/') ? new URL(href, this.url).toString() : href;
          if (!internalUrls.includes(fullUrl)) {
            internalUrls.push(fullUrl);
          }
        } catch {
          // Skip invalid URLs
        }
      }
    });

    // Sample max 10 links
    const sampled = internalUrls.slice(0, 10);

    const results = await Promise.allSettled(
      sampled.map(async (linkUrl) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          const response = await fetch(linkUrl, {
            method: 'HEAD',
            signal: controller.signal,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });
          clearTimeout(timeoutId);
          if (!response.ok) {
            return linkUrl;
          }
          return null;
        } catch {
          return linkUrl;
        }
      })
    );

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        brokenLinks.push(result.value);
      }
    }

    return brokenLinks;
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

    // NEW: Canonical URL
    if (!technical.hasCanonical) {
      issues.push({
        category: 'warning',
        title: 'Chybí canonical URL',
        description: 'Stránka nemá definovaný kanonický odkaz',
        impact: 'Riziko duplicitního obsahu v indexu vyhledávačů',
        recommendation: 'Přidat <link rel="canonical"> s preferovanou URL'
      });
    }

    // NEW: OG Tags
    if (!technical.hasOgTags) {
      issues.push({
        category: 'warning',
        title: 'Chybí Open Graph tagy',
        description: 'Stránka nemá definované OG meta tagy pro sociální sítě',
        impact: 'Špatný náhled při sdílení na Facebooku, LinkedInu atd.',
        recommendation: 'Přidat og:title, og:description a og:image meta tagy'
      });
    }

    // NEW: Twitter Card
    if (!technical.hasTwitterCard) {
      issues.push({
        category: 'info',
        title: 'Chybí Twitter Card tagy',
        description: 'Stránka nemá definované Twitter Card meta tagy',
        impact: 'Špatný náhled při sdílení na Twitteru/X',
        recommendation: 'Přidat twitter:card, twitter:title a twitter:image meta tagy'
      });
    }

    // NEW: Favicon
    if (!technical.hasFavicon) {
      issues.push({
        category: 'warning',
        title: 'Chybí favicon',
        description: 'Web nemá definovanou ikonu (favicon)',
        impact: 'Neprofesionální vzhled v záložce prohlížeče a ve výsledcích vyhledávání',
        recommendation: 'Přidat favicon ve formátu SVG nebo ICO'
      });
    }

    // NEW: Lang attribute
    if (!technical.hasLangAttribute) {
      issues.push({
        category: 'info',
        title: 'Chybí lang atribut',
        description: 'HTML element nemá definovaný jazyk (lang atribut)',
        impact: 'Přístupnost a správné zpracování textu prohlížečem/čtečkou',
        recommendation: 'Přidat lang="cs" (nebo odpovídající jazyk) na <html> element'
      });
    }

    // NEW: Large DOM
    if (technical.domElementCount > 3000) {
      issues.push({
        category: 'critical',
        title: 'Příliš velký DOM',
        description: `Stránka má ${technical.domElementCount} DOM elementů (doporučeno < 1500)`,
        impact: 'Výrazně zpomaluje vykreslování a interakci, zejména na mobilech',
        recommendation: 'Zjednodušit HTML strukturu, odstranit zbytečné vnořené elementy'
      });
    } else if (technical.domElementCount > 1500) {
      issues.push({
        category: 'warning',
        title: 'Velký DOM',
        description: `Stránka má ${technical.domElementCount} DOM elementů (doporučeno < 1500)`,
        impact: 'Může zpomalovat vykreslování a zvyšovat spotřebu paměti',
        recommendation: 'Optimalizovat HTML strukturu, zvážit lazy rendering'
      });
    }

    // NEW: Inline styles
    if (technical.inlineStyleCount > 20) {
      issues.push({
        category: 'info',
        title: 'Příliš mnoho inline stylů',
        description: `Nalezeno ${technical.inlineStyleCount} elementů s inline stylem`,
        impact: 'Těžší údržba, větší HTML, nemožnost cachovat styly',
        recommendation: 'Přesunout inline styly do externího CSS souboru'
      });
    }

    // NEW: Images without lazy loading
    if (technical.totalImages > 3 && technical.imagesWithLazyLoading === 0) {
      issues.push({
        category: 'warning',
        title: 'Obrázky bez lazy loading',
        description: `Žádný z ${technical.totalImages} obrázků nepoužívá lazy loading`,
        impact: 'Všechny obrázky se načítají najednou, zpomaluje initial load',
        recommendation: 'Přidat loading="lazy" na obrázky pod ohybem stránky'
      });
    }

    // NEW: No modern image formats
    if (technical.totalImages > 0 && technical.imagesWithModernFormat === 0) {
      issues.push({
        category: 'info',
        title: 'Chybí moderní formáty obrázků',
        description: 'Web nepoužívá WebP nebo AVIF formáty pro obrázky',
        impact: 'Větší velikost obrázků, pomalejší načítání',
        recommendation: 'Konvertovat obrázky do WebP/AVIF formátu (30-50% úspora)'
      });
    }

    // NEW: Heading hierarchy
    if (technical.headingOrder.length > 0) {
      const levels = technical.headingOrder.map(h => parseInt(h.replace('h', '')));
      let hasSkip = false;
      for (let i = 1; i < levels.length; i++) {
        if (levels[i] - levels[i - 1] > 1) {
          hasSkip = true;
          break;
        }
      }
      if (hasSkip) {
        issues.push({
          category: 'warning',
          title: 'Nesprávná hierarchie nadpisů',
          description: `Nadpisy přeskakují úrovně (${technical.headingOrder.slice(0, 8).join(' → ')})`,
          impact: 'Špatná struktura pro vyhledávače a přístupnost',
          recommendation: 'Dodržet postupnou hierarchii: H1 → H2 → H3 bez přeskakování'
        });
      }
    }

    // NEW: Broken internal links
    if (technical.brokenInternalLinks.length > 0) {
      issues.push({
        category: 'critical',
        title: 'Nefunkční interní odkazy',
        description: `Nalezeno ${technical.brokenInternalLinks.length} nefunkčních interních odkazů`,
        impact: 'Špatná uživatelská zkušenost, plýtvání crawl budgetem',
        recommendation: 'Opravit nebo odstranit nefunkční odkazy: ' + technical.brokenInternalLinks.slice(0, 3).join(', ')
      });
    }

    // Content issues
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

    // Security issues
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

    // Performance issues
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

  // Content Analysis - Readability & Word Count + Top Keywords
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
      const wordCount = Math.max(1, words.length);

      // Sentence count (approximate)
      const sentences = bodyText.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const sentenceCount = Math.max(1, sentences.length);

      // Paragraph count
      const paragraphCount = $('p').length;

      // Average words per sentence
      const averageWordsPerSentence = Math.round(wordCount / sentenceCount);

      // Syllable count (approximate for English)
      const countSyllables = (word: string): number => {
        try {
          word = word.toLowerCase().replace(/[^a-z]/g, '');
          if (word.length === 0) return 1;
          if (word.length <= 3) return 1;
          const vowels = word.match(/[aeiouy]+/g);
          let syllables = vowels ? vowels.length : 1;
          if (word.endsWith('e')) syllables--;
          if (word.endsWith('le') && word.length > 2) syllables++;
          return Math.max(1, syllables);
        } catch (e) {
          return 1;
        }
      };

      const totalSyllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
      const syllablesPerWord = wordCount > 0 ? totalSyllables / wordCount : 1;

      // Flesch Reading Ease Score
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

      // Top keywords extraction
      const wordFreq: Record<string, number> = {};
      words.forEach(w => {
        const clean = w.toLowerCase().replace(/[^a-záčďéěíňóřšťúůýž]/gi, '');
        if (clean.length >= 3 && !STOP_WORDS.has(clean)) {
          wordFreq[clean] = (wordFreq[clean] || 0) + 1;
        }
      });
      const topKeywords = Object.entries(wordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
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

      if (!securityHeaders.strictTransportSecurity) score -= 20;
      if (!securityHeaders.contentSecurityPolicy) score -= 20;
      if (!securityHeaders.xFrameOptions) score -= 15;
      if (!securityHeaders.xContentTypeOptions) score -= 10;
      if (!securityHeaders.referrerPolicy) score -= 10;
    } else {
      score = 0;
    }

    const mixedContent = this.url.startsWith('https://') &&
      this.html.includes('http://') &&
      !this.html.match(/http:\/\/localhost/);

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
    const hostname = new URL(this.url).hostname;

    // Count resources
    const scriptCount = $('script[src]').length;
    const stylesheetCount = $('link[rel="stylesheet"]').length;
    const imageCount = $('img[src]').length;
    const totalResources = scriptCount + stylesheetCount + imageCount;

    // Count third-party requests
    let thirdPartyRequests = 0;
    $('script[src], link[href], img[src]').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('href') || '';
      if (src.startsWith('http') && !src.includes(hostname)) {
        thirdPartyRequests++;
      }
    });

    // Check for lazy loading
    const hasLazyLoading = $('img[loading="lazy"]').length > 0;

    // Estimate size (very rough approximation)
    const htmlSize = this.html.length / 1024; // KB
    const estimatedResourcesSize = Math.round(
      htmlSize +
      scriptCount * 50 +
      stylesheetCount * 30 +
      imageCount * 100
    );

    const hasCompression = this.responseHeaders?.has('content-encoding') || false;
    const hasCaching = this.responseHeaders?.has('cache-control') || false;

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
      scriptCount,
      stylesheetCount,
      imageCount,
      thirdPartyRequests,
      hasLazyLoading,
    };
  }

  async analyze(): Promise<WebAnalysisResult> {
    const startTime = Date.now();

    // Fetch website
    await this.fetchWebsite();

    // Analyze technical aspects
    const technical = this.analyzeTechnical();

    // Run extended analysis
    const content = this.analyzeContent();
    const technology = this.analyzeTechnology();
    const security = this.analyzeSecurity();
    const performance = this.analyzePerformance();

    // Check sitemap, robots.txt, and broken links in parallel
    const [hasSitemap, hasRobotsTxt, brokenLinks] = await Promise.all([
      this.checkSitemap(),
      this.checkRobotsTxt(),
      this.checkBrokenLinks(),
    ]);

    technical.hasSitemap = hasSitemap;
    technical.hasRobotsTxt = hasRobotsTxt;
    technical.brokenInternalLinks = brokenLinks;
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
