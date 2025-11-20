import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock blog posts data
const blogPosts = {
  "jak-vybrat-webovou-agenturu-2025": {
    title: "Jak vybrat správnou webovou agenturu v roce 2025",
    excerpt: "Tipy a rady, na co se zaměřit při výběru partnera pro tvorbu webu",
    category: "Průvodce",
    date: "15. 11. 2025",
    readTime: "5 min",
    content: `
      <h2>Úvod</h2>
      <p>Výběr správné webové agentury je klíčové rozhodnutí pro úspěch vašeho online podnikání. V tomto článku se podíváme na nejdůležitější faktory, které byste měli zvážit.</p>

      <h2>1. Portfolio a reference</h2>
      <p>První věc, na kterou se podívejte, je portfolio agentury. Prohlédněte si jejich předchozí práce a zjistěte:</p>
      <ul>
        <li>Pracovali s podobnými projekty jako je váš?</li>
        <li>Jaká je kvalita jejich designu?</li>
        <li>Fungují weby rychle a jsou responzivní?</li>
      </ul>

      <h2>2. Technologie a know-how</h2>
      <p>Zjistěte, jaké technologie agentura používá. Moderní frameworky jako Next.js, React nebo Vue.js jsou zárukou kvalitního a rychlého webu.</p>

      <h2>3. Komunikace a přístup</h2>
      <p>Důležitá je i komunikace. Agentura by měla být:</p>
      <ul>
        <li>Rychlá v odpovědích</li>
        <li>Transparentní v cenách</li>
        <li>Ochotná vysvětlit technické detaily</li>
      </ul>

      <h2>4. Cena vs. kvalita</h2>
      <p>Nejlevnější řešení nemusí být vždy to nejlepší. Zaměřte se na poměr cena/výkon a zjistěte, co všechno je v ceně zahrnuto.</p>

      <h2>Závěr</h2>
      <p>Výběr správné agentury vyžaduje čas a research. Nebojte se zeptat na reference, prohlédnout si portfolio a srovnat více nabídek. Investice do kvalitního webu se vám vrátí.</p>
    `,
  },
  "10-duvodu-proc-potrebujete-responzivni-web": {
    title: "10 důvodů, proč potřebujete responzivní web",
    excerpt: "Mobilní zařízení tvoří více než 60% návštěvnosti. Je váš web připraven?",
    category: "Web Design",
    date: "12. 11. 2025",
    readTime: "4 min",
    content: `
      <h2>Co je responzivní web?</h2>
      <p>Responzivní web se automaticky přizpůsobuje velikosti obrazovky - ať už se díváte na mobilu, tabletu nebo počítači.</p>

      <h2>10 důvodů pro responzivní design:</h2>
      <ol>
        <li><strong>Mobilní návštěvnost:</strong> Více než 60% uživatelů přichází z mobilu</li>
        <li><strong>SEO výhoda:</strong> Google upřednostňuje mobile-friendly weby</li>
        <li><strong>Lepší UX:</strong> Uživatelé neopouštějí web kvůli špatné zobrazitelnosti</li>
        <li><strong>Vyšší konverze:</strong> Responzivní weby mají vyšší conversion rate</li>
        <li><strong>Jedna URL:</strong> Nemusíte mít separátní mobilní verzi (m.domena.cz)</li>
        <li><strong>Budoucnost:</strong> Nová zařízení s různými rozlišeními</li>
        <li><strong>Nižší náklady:</strong> Jedna verze webu místo několika</li>
        <li><strong>Rychlejší načítání:</strong> Optimalizováno pro všechna zařízení</li>
        <li><strong>Profesionální dojem:</strong> Moderní weby jsou vždy responzivní</li>
        <li><strong>Konkurenční výhoda:</strong> Ne všichni mají responzivní web</li>
      </ol>

      <h2>Jak poznáte, že váš web není responzivní?</h2>
      <p>Jednoduše - otevřete ho na mobilu. Pokud musíte zoomovat, scrollovat horizontálně nebo jsou texty nečitelné, není responzivní.</p>

      <h2>Závěr</h2>
      <p>V roce 2025 je responzivní web nutností, ne luxusem. Pokud váš web není připraven na mobilní zařízení, ztrácíte zákazníky.</p>
    `,
  },
  "seo-zaklady-prvni-stranka-google": {
    title: "SEO základy: Jak dostat web na první stránku Google",
    excerpt: "Kompletní průvodce SEO optimalizací pro začátečníky i pokročilé",
    category: "SEO",
    date: "8. 11. 2025",
    readTime: "8 min",
    content: `
      <h2>Co je SEO?</h2>
      <p>SEO (Search Engine Optimization) je optimalizace webu pro vyhledávače. Cílem je dostat váš web na první pozice ve výsledcích vyhledávání.</p>

      <h2>1. Keyword Research (Výzkum klíčových slov)</h2>
      <p>Prvním krokem je zjistit, co vaši zákazníci vyhledávají:</p>
      <ul>
        <li>Použijte Google Keyword Planner</li>
        <li>Analyzujte konkurenci</li>
        <li>Zaměřte se na long-tail keywords (delší fráze)</li>
      </ul>

      <h2>2. On-Page SEO</h2>
      <h3>Title a Meta Description</h3>
      <p>Každá stránka musí mít unikátní title (max 60 znaků) a meta description (max 160 znaků).</p>

      <h3>Heading struktura</h3>
      <p>Používejte H1, H2, H3 hierarchicky. Jeden H1 per page, obsahující hlavní keyword.</p>

      <h3>URL struktura</h3>
      <p>Krátké, popisné URL: <code>/sluzby/tvorba-webu</code> je lepší než <code>/page?id=123</code></p>

      <h2>3. Technické SEO</h2>
      <ul>
        <li><strong>Rychlost načítání:</strong> Pod 2 sekundy</li>
        <li><strong>Mobile-friendly:</strong> Responzivní design</li>
        <li><strong>HTTPS:</strong> SSL certifikát je nutnost</li>
        <li><strong>Sitemap.xml:</strong> Pro lepší indexaci</li>
      </ul>

      <h2>4. Content Marketing</h2>
      <p>Kvalitní obsah je král. Pište články, které:</p>
      <ul>
        <li>Řeší problémy uživatelů</li>
        <li>Mají minimálně 1000 slov</li>
        <li>Jsou unikátní (ne kopírované)</li>
        <li>Obsahují obrázky a videa</li>
      </ul>

      <h2>5. Backlinky</h2>
      <p>Odkazy z jiných webů na váš web zvyšují autoritu. Získejte je:</p>
      <ul>
        <li>Guest posting na relevantních blozích</li>
        <li>Registrace v katalozích</li>
        <li>PR články</li>
        <li>Spolupráce s influencery</li>
      </ul>

      <h2>Závěr</h2>
      <p>SEO je dlouhodobá hra. Výsledky uvidíte za 3-6 měsíců. Buďte trpěliví, konzistentní a měřte výsledky pomocí Google Analytics a Search Console.</p>
    `,
  },
};

type BlogPostKey = keyof typeof blogPosts;

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts[slug as BlogPostKey];

  if (!post) {
    return {
      title: "Článek nenalezen | Weblyx Blog",
    };
  }

  return {
    title: `${post.title} | Weblyx Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts[slug as BlogPostKey];

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen py-16 px-4">
      <article className="container mx-auto max-w-4xl">
        {/* Back button */}
        <Button asChild variant="ghost" className="mb-8">
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zpět na blog
          </Link>
        </Button>

        {/* Header */}
        <header className="mb-12 space-y-6">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full">
              {post.category}
            </span>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {post.date}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {post.readTime}
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold">{post.title}</h1>

          <p className="text-xl text-muted-foreground">{post.excerpt}</p>
        </header>

        {/* Featured image placeholder */}
        <div className="aspect-video bg-gradient-hero rounded-xl mb-12 flex items-center justify-center">
          <p className="text-muted-foreground">Náhledový obrázek článku</p>
        </div>

        {/* Content */}
        <div
          className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-primary prose-code:text-primary"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* CTA */}
        <div className="mt-16 p-8 bg-muted rounded-xl text-center space-y-4">
          <h3 className="text-2xl font-bold">Potřebujete pomoc s webem?</h3>
          <p className="text-muted-foreground">
            Naše agentura vám pomůže s tvorbou webu, SEO nebo redesignem.
          </p>
          <Button variant="outline" asChild size="lg">
            <Link href="/kontakt">Kontaktujte nás</Link>
          </Button>
        </div>
      </article>
    </main>
  );
}
