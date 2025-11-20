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

    // Pricing tiers data
    this.data.set('pricing_tiers', new Map([
      ['tier-1', {
        id: 'tier-1',
        name: 'Jednoduchý Web',
        price: '10 000',
        duration: '5-7 dní',
        description: 'Ideální pro malé firmy a živnostníky',
        popular: false,
        order: 1,
        features: [
          'Až 5 podstránek',
          'Responzivní design',
          'Základní SEO',
          'Kontaktní formulář',
          'Google Analytics',
          '1 měsíc podpora zdarma',
        ],
      }],
      ['tier-2', {
        id: 'tier-2',
        name: 'Standardní Web',
        price: '25 000',
        duration: '10-14 dní',
        description: 'Pro rostoucí firmy s většími požadavky',
        popular: true,
        order: 2,
        features: [
          'Až 15 podstránek',
          'Pokročilý design',
          'Pokročilé SEO',
          'Blog/Aktuality',
          'Animace a efekty',
          'Galerie obrázků',
          '3 měsíce podpora zdarma',
          'Úpravy po spuštění',
        ],
      }],
      ['tier-3', {
        id: 'tier-3',
        name: 'E-shop / Premium',
        price: '85 000',
        duration: 'Individuální',
        description: 'Pro e-commerce a komplexní projekty',
        popular: false,
        order: 3,
        features: [
          'Neomezený počet stránek',
          'E-shop funkcionalita',
          'Payment gateway integrace',
          'Admin panel',
          'Správa produktů',
          'Pokročilé funkce',
          '6 měsíců podpora zdarma',
          'Priority podpora',
        ],
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
