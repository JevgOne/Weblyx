/**
 * Firebase Admin SDK for Server-Side Data Fetching
 * Used in Next.js 15 Server Components for SEO-optimized data fetching
 *
 * Note: Currently uses mock implementation. To use real Firebase Admin SDK:
 * 1. Install firebase-admin: npm install firebase-admin
 * 2. Set FIREBASE_SERVICE_ACCOUNT environment variable
 * 3. Set NEXT_PUBLIC_USE_REAL_FIREBASE=true
 */

// Mock Firestore for development (without real Firebase)
const USE_MOCK = true; // Always use mock for now (firebase-admin not installed)

// Mock Firestore implementation for development
class MockFirestoreAdmin {
  private data: Map<string, Map<string, any>> = new Map();

  constructor() {
    // Initialize with seed data
    this.seedData();
  }

  private seedData() {
    // Hero section data
    this.data.set('homepage_sections', new Map([
      ['current', {
        badge: 'AI-powered workflow',
        title: 'Moderní weby za ceny,',
        titleHighlight: 'které vás překvapí',
        subtitle: 'Profesionální webové stránky od <strong>10 000 Kč</strong> • Dodání za <strong>5-7 dní</strong> • SEO optimalizace zdarma',
        ctaPrimary: { text: 'Nezávazná poptávka', href: '/poptavka' },
        ctaSecondary: { text: 'Zobrazit projekty', href: '/portfolio' },
        stats: [
          { icon: 'Clock', value: '5-7 dní', label: 'Dodání' },
          { icon: 'TrendingUp', value: '100%', label: 'Spokojenost' },
          { icon: 'Zap', value: '< 2s', label: 'Načtení' },
        ],
      }]
    ]));

    // Services data
    this.data.set('services', new Map([
      ['service-1', {
        id: 'service-1',
        icon: 'Globe',
        title: 'Webové stránky',
        description: 'Moderní, responzivní weby přizpůsobené vašim potřebám. Od jednoduchých prezentací po komplexní firemní weby.',
        order: 1,
        isActive: true,
      }],
      ['service-2', {
        id: 'service-2',
        icon: 'TrendingUp',
        title: 'SEO optimalizace',
        description: 'Dostaňte se na přední pozice ve vyhledávačích. Komplexní on-page i off-page optimalizace pro lepší viditelnost.',
        order: 2,
        isActive: true,
      }],
      ['service-3', {
        id: 'service-3',
        icon: 'ShoppingCart',
        title: 'E-shopy',
        description: 'Kompletní řešení pro online prodej. Propojení s platebními branami, správa skladu a expedice objednávek.',
        order: 3,
        isActive: true,
      }],
      ['service-4', {
        id: 'service-4',
        icon: 'Palette',
        title: 'Redesign',
        description: 'Modernizace zastaralých webů. Nový design, lepší UX a vyšší konverze při zachování vaší značky.',
        order: 4,
        isActive: true,
      }],
      ['service-5', {
        id: 'service-5',
        icon: 'Zap',
        title: 'Rychlost načítání',
        description: 'Optimalizace výkonu pro bleskově rychlé načítání. Méně než 2 sekundy pro lepší SEO a uživatelskou zkušenost.',
        order: 5,
        isActive: true,
      }],
      ['service-6', {
        id: 'service-6',
        icon: 'HeadphonesIcon',
        title: 'Údržba a podpora',
        description: 'Pravidelné aktualizace, zálohy a technická podpora. Váš web bude vždy funkční a bezpečný.',
        order: 6,
        isActive: true,
      }],
    ]));

    // Portfolio projects data
    this.data.set('portfolio', new Map([
      ['portfolio-1', {
        id: 'portfolio-1',
        title: 'E-shop s módou',
        category: 'E-commerce',
        description: 'Moderní e-shop s pokročilými filtry a platební bránou',
        technologies: ['Next.js', 'Stripe', 'Tailwind'],
        image: '/images/portfolio-1.jpg',
        published: true,
        featured: true,
        displayOrder: 1,
      }],
      ['portfolio-2', {
        id: 'portfolio-2',
        title: 'Firemní prezentace',
        category: 'Web',
        description: 'Responzivní web pro konzultační společnost',
        technologies: ['React', 'SEO', 'Analytics'],
        image: '/images/portfolio-2.jpg',
        published: true,
        featured: true,
        displayOrder: 2,
      }],
      ['portfolio-3', {
        id: 'portfolio-3',
        title: 'Restaurace & Menu',
        category: 'Web',
        description: 'Web s online rezervačním systémem a menu',
        technologies: ['Next.js', 'Booking', 'Maps'],
        image: '/images/portfolio-3.jpg',
        published: true,
        featured: true,
        displayOrder: 3,
      }],
      ['portfolio-4', {
        id: 'portfolio-4',
        title: 'Portfolio fotografa',
        category: 'Portfolio',
        description: 'Galerie s optimalizací obrázků a lazy loading',
        technologies: ['Next.js', 'Image Opt', 'Lightbox'],
        image: '/images/portfolio-4.jpg',
        published: true,
        featured: true,
        displayOrder: 4,
      }],
      ['portfolio-5', {
        id: 'portfolio-5',
        title: 'SaaS Landing Page',
        category: 'Landing',
        description: 'Konverzní landing page s A/B testingem',
        technologies: ['React', 'Analytics', 'CRO'],
        image: '/images/portfolio-5.jpg',
        published: true,
        featured: true,
        displayOrder: 5,
      }],
      ['portfolio-6', {
        id: 'portfolio-6',
        title: 'Blog & Magazín',
        category: 'Blog',
        description: 'Content-focused web s CMS a vyhledáváním',
        technologies: ['Next.js', 'CMS', 'Search'],
        image: '/images/portfolio-6.jpg',
        published: true,
        featured: true,
        displayOrder: 6,
      }],
    ]));

    // Pricing tiers data (using CMS schema)
    this.data.set('pricing_tiers', new Map([
      ['tier-1', {
        id: 'tier-1',
        name: 'Jednoduchý Web',
        price: 10000,
        currency: 'CZK',
        interval: 'one-time' as const,
        description: 'Ideální pro malé firmy a živnostníky',
        highlighted: false,
        ctaText: 'Vybrat balíček',
        ctaLink: '/poptavka',
        order: 1,
        enabled: true,
        features: [
          'Až 5 podstránek',
          'Responzivní design',
          'Základní SEO',
          'Kontaktní formulář',
          'Google Analytics',
          '1 měsíc podpora zdarma',
          'Dodání za 5-7 dní',
        ],
      }],
      ['tier-2', {
        id: 'tier-2',
        name: 'Standardní Web',
        price: 25000,
        currency: 'CZK',
        interval: 'one-time' as const,
        description: 'Pro rostoucí firmy s většími požadavky',
        highlighted: true,
        ctaText: 'Vybrat balíček',
        ctaLink: '/poptavka',
        order: 2,
        enabled: true,
        features: [
          'Až 15 podstránek',
          'Pokročilý design',
          'Pokročilé SEO',
          'Blog/Aktuality',
          'Animace a efekty',
          'Galerie obrázků',
          '3 měsíce podpora zdarma',
          'Úpravy po spuštění',
          'Dodání za 10-14 dní',
        ],
      }],
      ['tier-3', {
        id: 'tier-3',
        name: 'E-shop / Premium',
        price: 85000,
        currency: 'CZK',
        interval: 'one-time' as const,
        description: 'Pro e-commerce a komplexní projekty',
        highlighted: false,
        ctaText: 'Vybrat balíček',
        ctaLink: '/poptavka',
        order: 3,
        enabled: true,
        features: [
          'Neomezený počet stránek',
          'E-shop funkcionalita',
          'Payment gateway integrace',
          'Admin panel',
          'Správa produktů',
          'Pokročilé funkce',
          '6 měsíců podpora zdarma',
          'Priority podpora',
          'Dodání dle dohody',
        ],
      }],
    ]));

    // Process section data
    this.data.set('homepage_process', new Map([
      ['section-meta', {
        id: 'section-meta',
        heading: 'Jak to funguje',
        subheading: 'Náš proces je jednoduchý, transparentní a efektivní',
        enabled: true,
      }],
      ['step-1', {
        id: 'step-1',
        number: '01',
        icon: 'MessageSquare',
        title: 'Konzultace',
        description: 'Nezávazná konzultace zdarma, kde si vyslechneme vaše požadavky a cíle.',
        order: 1,
        enabled: true,
      }],
      ['step-2', {
        id: 'step-2',
        number: '02',
        icon: 'Palette',
        title: 'Návrh designu',
        description: 'Vytvoříme moderní design odpovídající vaší značce a cílové skupině.',
        order: 2,
        enabled: true,
      }],
      ['step-3', {
        id: 'step-3',
        number: '03',
        icon: 'Code',
        title: 'Vývoj',
        description: 'Naprogramujeme web s využitím nejnovějších technologií a best practices.',
        order: 3,
        enabled: true,
      }],
      ['step-4', {
        id: 'step-4',
        number: '04',
        icon: 'TestTube',
        title: 'Testování',
        description: 'Důkladně otestujeme všechny funkce, responzivitu a rychlost načítání.',
        order: 4,
        enabled: true,
      }],
      ['step-5', {
        id: 'step-5',
        number: '05',
        icon: 'Rocket',
        title: 'Spuštění',
        description: 'Zveřejníme váš web na internetu a zajistíme bezproblémový start.',
        order: 5,
        enabled: true,
      }],
      ['step-6', {
        id: 'step-6',
        number: '06',
        icon: 'Wrench',
        title: 'Podpora',
        description: 'Poskytujeme následnou podporu, aktualizace a údržbu vašeho webu.',
        order: 6,
        enabled: true,
      }],
    ]));

    // FAQ section data
    this.data.set('homepage_faq', new Map([
      ['faq-meta', {
        id: 'faq-meta',
        heading: 'Často kladené otázky',
        subheading: 'Odpovědi na nejčastější dotazy',
        enabled: true,
      }],
      ['faq-1', {
        id: 'faq-1',
        question: 'Jak dlouho trvá vytvoření webu?',
        answer: 'Jednoduché webové stránky dodáme za 5-7 dní. Standardní weby s rozšířenými funkcemi obvykle trvají 10-14 dní. E-shopy a složitější projekty jsou individuální a závisí na rozsahu funkcí. Po úvodní konzultaci vám poskytneme přesný časový odhad.',
        order: 1,
        enabled: true,
      }],
      ['faq-2', {
        id: 'faq-2',
        question: 'Kolik stojí webové stránky?',
        answer: 'Startovací cena je 10 000 Kč pro jednoduchý web s až 5 podstránkami. Standardní weby začínají na 25 000 Kč a e-shopy od 85 000 Kč. Finální cena závisí na počtu stránek, funkcích a designové složitosti. Po vyplnění dotazníku vám připravíme konkrétní nabídku.',
        order: 2,
        enabled: true,
      }],
      ['faq-3', {
        id: 'faq-3',
        question: 'Poskytujete i doménu a hosting?',
        answer: 'Ano, můžeme zajistit doménu i hosting, nebo vám pomůžeme s nastavením, pokud už je máte. Doporučujeme kvalitní hosting pro optimální rychlost a bezpečnost vašeho webu. Cena hostingu začína na cca 100-300 Kč měsíčně podle typu webu.',
        order: 3,
        enabled: true,
      }],
      ['faq-4', {
        id: 'faq-4',
        question: 'Mohu si web spravovat sám?',
        answer: 'Samozřejmě! Pokud chcete, implementujeme jednoduché CMS (Content Management System), které vám umožní měnit texty, přidávat fotky a publikovat články bez znalosti programování. Poskytneme vám také školení nebo video návod.',
        order: 4,
        enabled: true,
      }],
      ['faq-5', {
        id: 'faq-5',
        question: 'Děláte i e-shopy?',
        answer: 'Ano, vytváříme plně funkční e-shopy s propojením na platební brány (GoPay, Stripe, PayPal), správou produktů, skladu a objednávek. E-shopy začínají na 85 000 Kč a zahrnují vše potřebné pro online prodej.',
        order: 5,
        enabled: true,
      }],
      ['faq-6', {
        id: 'faq-6',
        question: 'Nabízíte následnou podporu?',
        answer: 'Ano, k jednoduchému webu poskytujeme 1 měsíc podpory zdarma, ke standardnímu 3 měsíce a k e-shopu 6 měsíců. Po této době můžete využít naše servisní balíčky nebo jednorázové úpravy podle potřeby.',
        order: 6,
        enabled: true,
      }],
      ['faq-7', {
        id: 'faq-7',
        question: 'Jaké technologie používáte?',
        answer: 'Používáme moderní technologie jako Next.js, React a TypeScript pro maximální výkon a bezpečnost. Pro styling používáme Tailwind CSS. Backend řešíme přes Supabase nebo vlastní API. Všechny weby jsou responzivní a SEO optimalizované.',
        order: 7,
        enabled: true,
      }],
      ['faq-8', {
        id: 'faq-8',
        question: 'Jak probíhá platba?',
        answer: 'Standardně vyžadujeme zálohu 50% před zahájením prací a zbytek před předáním hotového webu. U větších projektů můžeme dohodnout rozložení na více splátek. Platbu můžete provést fakturou s QR kódem nebo bankovním převodem.',
        order: 8,
        enabled: true,
      }],
    ]));

    // CTA section data
    this.data.set('homepage_cta', new Map([
      ['current', {
        id: 'current',
        heading: 'Připraveni na nový web?',
        subheading: 'Stačí vyplnit formulář a my se vám ozveme do 24 hodin s konkrétní nabídkou',
        primaryButtonText: 'Začít projekt',
        primaryButtonLink: '/poptavka',
        secondaryButtonText: 'Kontaktovat nás',
        secondaryButtonLink: '/kontakt',
        benefits: [
          { icon: 'Clock', title: '24h Odpověď', description: 'na poptávku' },
          { icon: 'DollarSign', title: '0 Kč Poplatek', description: 'za konzultaci' },
          { icon: 'Shield', title: '100% Bez závazků', description: 'nezávazná nabídka' },
        ],
        enabled: true,
      }],
    ]));

    // Contact info data
    this.data.set('contact_info', new Map([
      ['current', {
        id: 'current',
        heading: 'Napište nám',
        subheading: 'Nezávazně nás kontaktujte a my vám do 24 hodin odpovíme',
        email: 'info@weblyx.cz',
        address: 'Praha, Česká republika',
        openingHours: {
          weekdays: 'Po - Pá: 9:00 - 18:00',
          weekend: 'So - Ne: Zavřeno',
        },
        formLabels: {
          name: 'Jméno a příjmení',
          email: 'Email',
          phone: 'Telefon',
          projectType: 'Typ projektu',
          budget: 'Orientační rozpočet',
          message: 'Zpráva',
          submit: 'Odeslat zprávu',
          submitting: 'Odesílání...',
        },
        projectTypes: [
          { value: 'web', label: 'Webové stránky' },
          { value: 'eshop', label: 'E-shop' },
          { value: 'redesign', label: 'Redesign' },
          { value: 'seo', label: 'SEO optimalizace' },
          { value: 'other', label: 'Jiné' },
        ],
        budgetOptions: [
          { value: '10-20k', label: '10 000 - 20 000 Kč' },
          { value: '20-50k', label: '20 000 - 50 000 Kč' },
          { value: '50-100k', label: '50 000 - 100 000 Kč' },
          { value: '100k+', label: '100 000+ Kč' },
          { value: 'flexible', label: 'Flexibilní' },
        ],
        enabled: true,
      }],
    ]));

    // Page Content data - Universal content for static pages and section headings
    this.data.set('page_content', new Map([
      ['homepage-services', {
        pageId: 'homepage-services',
        pageName: 'Homepage - Služby sekce',
        category: 'homepage',
        content: {
          heading: 'Naše služby',
          subheading: 'Komplexní řešení pro vaši online přítomnost'
        },
        updatedAt: new Date().toISOString(),
        updatedBy: 'system'
      }],
      ['homepage-portfolio', {
        pageId: 'homepage-portfolio',
        pageName: 'Homepage - Portfolio sekce',
        category: 'homepage',
        content: {
          heading: 'Naše projekty',
          subheading: 'Ukázky naší práce a realizovaných projektů',
          buttonText: 'Zobrazit všechny projekty'
        },
        updatedAt: new Date().toISOString(),
        updatedBy: 'system'
      }],
      ['homepage-pricing', {
        pageId: 'homepage-pricing',
        pageName: 'Homepage - Ceník sekce',
        category: 'homepage',
        content: {
          heading: 'Cenové balíčky',
          subheading: 'Transparentní ceny bez skrytých poplatků',
          footerNote: 'Ceny jsou orientační. Finální cena závisí na rozsahu a složitosti projektu.'
        },
        updatedAt: new Date().toISOString(),
        updatedBy: 'system'
      }],
      ['about-page', {
        pageId: 'about-page',
        pageName: 'O nás - Statická stránka',
        category: 'static-page',
        content: {
          heading: 'O nás',
          subheading: 'Jsme tým, který miluje web development',
          description: 'Vytváříme moderní webové stránky s důrazem na rychlost, design a uživatelskou zkušenost. Naše mise je pomoci malým a středním firmám získat profesionální online přítomnost za dostupné ceny.'
        },
        updatedAt: new Date().toISOString(),
        updatedBy: 'system'
      }],
      ['services-page', {
        pageId: 'services-page',
        pageName: 'Služby - Statická stránka',
        category: 'static-page',
        content: {
          heading: 'Naše služby',
          subheading: 'Kompletní řešení pro váš online úspěch',
          description: 'Od návrhu přes vývoj až po údržbu - poskytujeme komplexní služby pro váš web.'
        },
        updatedAt: new Date().toISOString(),
        updatedBy: 'system'
      }],
      ['contact-info', {
        pageId: 'contact-info',
        pageName: 'Kontakt - Informace',
        category: 'section',
        content: {
          heading: 'Napište nám',
          subheading: 'Nezávazně nás kontaktujte a my vám do 24 hodin odpovíme',
          responseTime: '24 hodin',
          availability: 'Po - Pá: 9:00 - 18:00'
        },
        updatedAt: new Date().toISOString(),
        updatedBy: 'system'
      }],
    ]));
  }

  collection(collectionName: string) {
    return {
      doc: (docId: string) => ({
        get: async () => {
          const collection = this.data.get(collectionName);
          const data = collection?.get(docId);
          return {
            exists: !!data,
            data: () => data,
            id: docId,
          };
        },
      }),
      where: (field: string, operator: string, value: any) => {
        const filters = [{ field, operator, value }];

        const buildQuery = (currentFilters: any[]) => ({
          where: (nextField: string, nextOperator: string, nextValue: any) => {
            currentFilters.push({ field: nextField, operator: nextOperator, value: nextValue });
            return buildQuery(currentFilters);
          },
          orderBy: (orderField: string) => ({
            limit: (limitNum: number) => ({
              get: async () => {
                const collection = this.data.get(collectionName);
                if (!collection) return { docs: [], empty: true };

                let docs = Array.from(collection.values()).filter(doc => {
                  return currentFilters.every(filter => {
                    if (filter.operator === '==') return doc[filter.field] === filter.value;
                    if (filter.operator === '!=') return doc[filter.field] !== filter.value;
                    return false;
                  });
                });

                // Sort by orderField
                docs.sort((a, b) => {
                  const aVal = a[orderField] ?? 0;
                  const bVal = b[orderField] ?? 0;
                  return aVal - bVal;
                });

                // Limit results
                docs = docs.slice(0, limitNum);

                return {
                  docs: docs.map(doc => ({
                    id: doc.id,
                    data: () => doc,
                  })),
                  empty: docs.length === 0,
                };
              },
            }),
          }),
        });

        return buildQuery(filters);
      },
      orderBy: (orderField: string) => ({
        get: async () => {
          const collection = this.data.get(collectionName);
          if (!collection) return { docs: [], empty: true };

          let docs = Array.from(collection.values());

          // Sort by orderField
          docs.sort((a, b) => {
            const aVal = a[orderField] ?? 0;
            const bVal = b[orderField] ?? 0;
            return aVal - bVal;
          });

          return {
            docs: docs.map(doc => ({
              id: doc.id,
              data: () => doc,
            })),
            empty: docs.length === 0,
          };
        },
      }),
    };
  }
}

// Create mock instance
const mockDb = new MockFirestoreAdmin();

// Export the database instance (always mock for now)
export const adminDbInstance = mockDb;

console.log('🎭 Using MOCK Firebase Admin (server-side) - Install firebase-admin for production use');
