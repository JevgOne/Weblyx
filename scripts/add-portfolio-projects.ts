import { turso, stringifyJSON } from '../lib/turso';
import { nanoid } from 'nanoid';

const projects = [
  {
    title: "Salon Lucie - Rezervační systém",
    description: "Moderní web pro kosmetický salon s online rezervačním systémem a galerií služeb. Zaměřeno na rychlost a uživatelskou přívětivost.",
    category: "Služby",
    technologies: ["Next.js", "Tailwind CSS", "Vercel", "Booking API"],
    projectUrl: "https://example.com/salon-lucie",
    imageUrl: "",
    pagespeedMobile: 95,
    pagespeedDesktop: 98,
    loadTimeBefore: 6.2,
    loadTimeAfter: 1.4,
    featured: true,
    published: true,
    order: 3
  },
  {
    title: "TechStart - Startup landing page",
    description: "Landing page pro technologický startup s důrazem na moderní design a konverzi. Optimalizováno pro investory a early adopters.",
    category: "Startup",
    technologies: ["Next.js", "Framer Motion", "Stripe", "Analytics"],
    projectUrl: "https://example.com/techstart",
    imageUrl: "",
    pagespeedMobile: 92,
    pagespeedDesktop: 96,
    loadTimeBefore: 5.8,
    loadTimeAfter: 1.6,
    featured: true,
    published: true,
    order: 4
  },
  {
    title: "PD Stavby - Prezentace firmy",
    description: "Profesionální web pro stavební firmu s galerií realizací, referencemi a kontaktním formulářem. SEO optimalizováno pro lokální vyhledávání.",
    category: "Stavebnictví",
    technologies: ["Next.js", "Tailwind CSS", "Google Maps", "Image Optimization"],
    projectUrl: "https://example.com/pd-stavby",
    imageUrl: "",
    pagespeedMobile: 94,
    pagespeedDesktop: 97,
    loadTimeBefore: 7.1,
    loadTimeAfter: 1.5,
    featured: true,
    published: true,
    order: 5
  },
  {
    title: "Café Relax - Menu a rezervace",
    description: "Web pro kavárnu s online menu, rezervačním systémem a fotogalerií. Responzivní design optimalizovaný pro mobilní zařízení.",
    category: "Gastronomie",
    technologies: ["Next.js", "Tailwind CSS", "PWA", "Reservation System"],
    projectUrl: "https://example.com/cafe-relax",
    imageUrl: "",
    pagespeedMobile: 96,
    pagespeedDesktop: 99,
    loadTimeBefore: 5.5,
    loadTimeAfter: 1.2,
    featured: true,
    published: true,
    order: 6
  },
  {
    title: "FitZone - Fitness centrum",
    description: "Web pro fitness centrum s rozvrhem hodin, profily trenérů a online nákupem permanentek. Integrace s platební bránou.",
    category: "Sport",
    technologies: ["Next.js", "Stripe", "Calendar API", "Video Streaming"],
    projectUrl: "https://example.com/fitzone",
    imageUrl: "",
    pagespeedMobile: 91,
    pagespeedDesktop: 95,
    loadTimeBefore: 6.8,
    loadTimeAfter: 1.8,
    featured: true,
    published: true,
    order: 7
  }
];

async function main() {
  console.log('🚀 Přidávám portfolio projekty do databáze...\n');

  for (const project of projects) {
    try {
      const id = nanoid();
      const now = Math.floor(Date.now() / 1000);

      await turso.execute({
        sql: `INSERT INTO portfolio (
          id, title, description, category, technologies,
          project_url, image_url,
          pagespeed_mobile, pagespeed_desktop, load_time_before, load_time_after,
          featured, published, "order", created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          project.title,
          project.description,
          project.category,
          stringifyJSON(project.technologies),
          project.projectUrl,
          project.imageUrl,
          project.pagespeedMobile,
          project.pagespeedDesktop,
          project.loadTimeBefore,
          project.loadTimeAfter,
          project.featured ? 1 : 0,
          project.published ? 1 : 0,
          project.order,
          now,
          now,
        ],
      });

      console.log(`✅ Přidán projekt: ${project.title} (PageSpeed: ${project.pagespeedMobile}/${project.pagespeedDesktop})`);
    } catch (error) {
      console.error(`❌ Chyba při přidání projektu ${project.title}:`, error);
    }
  }

  console.log('\n✨ Hotovo! Portfolio projekty přidány.');
}

main();
