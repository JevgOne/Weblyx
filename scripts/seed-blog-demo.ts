#!/usr/bin/env tsx
/**
 * Seed Demo Blog Post
 * Creates a sample blog post for testing
 */

import { createBlogPost } from '../lib/turso/blog';

async function seedDemoBlogPost() {
  console.log('🚀 Creating demo blog post...');

  try {
    const demoPost = await createBlogPost({
      title: 'Kolik stojí tvorba webu v roce 2025? Přehled cen pro živnostníky a malé firmy',
      slug: 'kolik-stoji-tvorba-webu-2025',
      content: `
        <h2>Úvod</h2>
        <p>Zvažujete nový web a nevíte, kolik by měl stát? V tomto článku si přehledně vysvětlíme, kolik stojí tvorba webu v roce 2025 – od levných šablon až po profesionální řešení.</p>

        <h2>Cenové úrovně tvorby webu</h2>

        <h3>1. Šablonové weby (5 000 - 15 000 Kč)</h3>
        <p>Nejlevnější varianta využívající předpřipravené šablony na platformách jako WordPress, Wix nebo Webnode. Vhodné pro úplné začátečníky s minimálním rozpočtem.</p>
        <ul>
          <li>Rychlé spuštění (1-3 dny)</li>
          <li>Omezená unikátnost</li>
          <li>Základní funkce</li>
        </ul>

        <h3>2. Profesionální web na míru (10 000 - 50 000 Kč)</h3>
        <p>Kvalitní web vytvořený na moderních technologiích, přizpůsobený vašim potřebám. To je náš Weblyx přístup.</p>
        <ul>
          <li>Moderní technologie (Next.js, React)</li>
          <li>Rychlost načítání pod 2 sekundy</li>
          <li>SEO optimalizace</li>
          <li>Mobilní responzivita</li>
        </ul>

        <h3>3. Komplexní řešení (50 000 - 200 000+ Kč)</h3>
        <p>Pro velké projekty vyžadující pokročilé funkce, e-commerce nebo vlastní systémy.</p>

        <h2>Co ovlivňuje cenu webu?</h2>
        <ul>
          <li><strong>Počet stránek</strong> - Od jednoduchého one-pager po rozsáhlý web se stovkami podstránek</li>
          <li><strong>Funkce</strong> - Kontaktní formulář, rezervace, platební brána, blog</li>
          <li><strong>Design</strong> - Šablona vs. unikátní design</li>
          <li><strong>Technologie</strong> - WordPress vs. moderní frameworky</li>
          <li><strong>SEO</strong> - Optimalizace pro vyhledávače</li>
        </ul>

        <h2>Naše cenové balíčky Weblyx</h2>

        <h3>Start (10 000 Kč)</h3>
        <p>Ideální pro živnostníky a malé firmy:</p>
        <ul>
          <li>1-3 stránky</li>
          <li>Moderní design</li>
          <li>Kontaktní formulář</li>
          <li>SEO základ</li>
          <li>Dodání za 5-7 dní</li>
        </ul>

        <h3>Business (25 000 Kč)</h3>
        <p>Pro rostoucí firmy:</p>
        <ul>
          <li>5-10 stránek</li>
          <li>Blog</li>
          <li>Pokročilé SEO</li>
          <li>Rychlost pod 2 sekundy</li>
          <li>Admin panel</li>
        </ul>

        <h2>Závěr</h2>
        <p>Cena webu v roce 2025 závisí na vašich potřebách a cílech. Pro živnostníky a malé firmy je optimální investice 10 000 - 25 000 Kč, která vám zajistí moderní, rychlý a SEO optimalizovaný web.</p>

        <p>Chcete vědět přesnou cenu pro váš projekt? <a href="/poptavka">Pošlete nám nezávaznou poptávku</a> a do 24 hodin se vám ozveme s nabídkou šitou na míru.</p>
      `,
      excerpt: 'Zvažujete nový web a nevíte, kolik by měl stát? Přehledně vysvětlujeme, kolik stojí tvorba webu v roce 2025 – od levných šablon až po profesionální řešení a konkrétní balíčky Weblyx.',
      authorName: 'Weblyx Team',
      featuredImage: undefined,
      published: true,
      publishedAt: new Date('2025-09-05'),
      tags: ['tvorba webu', 'ceny', 'ceník', 'živnostníci', 'malé firmy'],
      metaTitle: 'Kolik stojí tvorba webu v roce 2025? | Kompletní přehled cen',
      metaDescription: 'Zjistěte, kolik stojí tvorba webu v roce 2025. Přehled cen od šablon (5 000 Kč) po profesionální řešení (50 000+ Kč). Konkrétní balíčky pro živnostníky a malé firmy.',
    });

    console.log('✅ Demo blog post created:');
    console.log(`   ID: ${demoPost.id}`);
    console.log(`   Title: ${demoPost.title}`);
    console.log(`   Slug: ${demoPost.slug}`);
    console.log(`   URL: https://weblyx.cz/blog/${demoPost.slug}`);

    console.log('\n🎉 Blog seed completed successfully!');
  } catch (error) {
    console.error('❌ Error creating demo post:', error);
    process.exit(1);
  }
}

// Run seed
seedDemoBlogPost();
