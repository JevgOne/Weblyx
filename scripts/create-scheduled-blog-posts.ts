#!/usr/bin/env tsx

/**
 * Create scheduled blog posts for the next month
 *
 * This script generates SEO-optimized blog posts using Claude AI
 * and schedules them for publication throughout February 2026
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import Anthropic from '@anthropic-ai/sdk';

// Load environment variables BEFORE any imports
dotenv.config({ path: path.join(__dirname, '..', '.env.production.local') });
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

import type { CreateBlogPostData } from '../types/blog';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Blog topics for Weblyx (web agency focused on speed & SEO)
const blogTopics = [
  {
    title: 'Jak zvýšit rychlost webu: 10 praktických tipů pro rok 2026',
    keywords: 'rychlost webu, PageSpeed, optimalizace, performance',
    category: 'Performance',
    scheduledDate: new Date('2026-02-01T09:00:00'),
  },
  {
    title: 'SEO trendy 2026: Co musíte vědět pro úspěšné organické výsledky',
    keywords: 'SEO, vyhledávače, Google, optimalizace, trendy 2026',
    category: 'SEO',
    scheduledDate: new Date('2026-02-04T14:00:00'),
  },
  {
    title: 'Next.js vs. WordPress: Která technologie je lepší pro váš byznys?',
    keywords: 'Next.js, WordPress, JAMstack, výběr technologie',
    category: 'Development',
    scheduledDate: new Date('2026-02-07T10:00:00'),
  },
  {
    title: 'Core Web Vitals: Průvodce optimalizací pro perfektní skóre',
    keywords: 'Core Web Vitals, LCP, FID, CLS, Google, PageSpeed',
    category: 'Performance',
    scheduledDate: new Date('2026-02-10T09:00:00'),
  },
  {
    title: 'Lokální SEO v roce 2026: Jak se dostat na mapu Googlu',
    keywords: 'lokální SEO, Google Maps, GMB, místní firmy',
    category: 'SEO',
    scheduledDate: new Date('2026-02-13T15:00:00'),
  },
  {
    title: 'Web Design trendy 2026: Minimalismus, animace a AI',
    keywords: 'web design, trendy, UI/UX, minimalism, AI design',
    category: 'Design',
    scheduledDate: new Date('2026-02-16T11:00:00'),
  },
  {
    title: 'E-commerce: Jak zvýšit konverze o 50% pomocí UX optimalizace',
    keywords: 'e-commerce, konverze, UX, optimalizace, online prodej',
    category: 'E-commerce',
    scheduledDate: new Date('2026-02-19T10:00:00'),
  },
  {
    title: 'AI v webových aplikacích: Praktické využití ChatGPT a Claude',
    keywords: 'AI, ChatGPT, Claude, webové aplikace, automatizace',
    category: 'AI & Development',
    scheduledDate: new Date('2026-02-22T14:00:00'),
  },
  {
    title: 'Mobile-first indexing: Proč Google upřednostňuje mobilní verze',
    keywords: 'mobile-first, mobilní web, responsive design, Google',
    category: 'SEO',
    scheduledDate: new Date('2026-02-25T09:00:00'),
  },
  {
    title: 'Bezpečnost webu: SSL, HTTPS a ochrana proti hackerům',
    keywords: 'bezpečnost, SSL, HTTPS, security, ochrana webu',
    category: 'Security',
    scheduledDate: new Date('2026-02-28T13:00:00'),
  },
];

async function generateBlogContent(topic: typeof blogTopics[0]): Promise<CreateBlogPostData> {
  console.log(`\n📝 Generating content for: ${topic.title}`);

  const prompt = `You are a professional web development and SEO content writer for Weblyx, a Czech web agency specializing in fast, SEO-optimized websites.

Write a comprehensive, SEO-optimized blog post in CZECH language about:

Title: ${topic.title}
Keywords: ${topic.keywords}
Category: ${topic.category}

Requirements:
1. Write in Czech language (important!)
2. Length: 1200-1500 words
3. Use markdown formatting (headings, lists, bold, links)
4. Include practical tips and actionable advice
5. Add code examples where relevant (wrapped in markdown code blocks)
6. Structure:
   - Introduction (hook the reader)
   - 3-5 main sections with H2 headings
   - Conclusion with call-to-action
7. SEO optimized but natural writing
8. Professional tone, but friendly and accessible
9. Include internal links to Weblyx services where relevant (use https://www.weblyx.cz/sluzby)

Return JSON in this format:
{
  "content": "full markdown content here",
  "excerpt": "2-3 sentence summary (150-200 chars)",
  "metaTitle": "SEO title (50-60 chars)",
  "metaDescription": "SEO description (150-160 chars)"
}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const textContent = response.content[0];
    if (textContent.type !== 'text') {
      throw new Error('Unexpected response format');
    }

    let jsonText = textContent.text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const aiResponse = JSON.parse(jsonText);

    // Create slug from title
    const slug = topic.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    return {
      title: topic.title,
      slug,
      content: aiResponse.content,
      excerpt: aiResponse.excerpt,
      metaTitle: aiResponse.metaTitle,
      metaDescription: aiResponse.metaDescription,
      authorName: 'Weblyx Team',
      featuredImage: undefined, // Can add later
      tags: topic.keywords.split(', '),
      published: false, // Will be published by cron
      language: 'cs',
      scheduledDate: topic.scheduledDate,
      autoTranslate: true, // Auto-create German translation
    };
  } catch (error) {
    console.error('❌ Error generating content:', error);
    throw error;
  }
}

async function createScheduledBlogPosts() {
  // Dynamic import AFTER env is loaded
  const { createBlogPost } = await import('../lib/turso/blog');

  console.log('🚀 Creating scheduled blog posts for February 2026\n');
  console.log(`📅 ${blogTopics.length} articles will be scheduled\n`);

  const results = {
    created: [] as string[],
    errors: [] as { topic: string; error: string }[],
  };

  for (const topic of blogTopics) {
    try {
      // Generate content using AI
      const blogData = await generateBlogContent(topic);

      // Create blog post in database
      const createdPost = await createBlogPost(blogData);

      results.created.push(createdPost.id);
      console.log(`✅ Created: ${topic.title}`);
      console.log(`   ID: ${createdPost.id}`);
      console.log(`   Scheduled: ${topic.scheduledDate.toLocaleString('cs-CZ')}`);
      console.log(`   Auto-translate: Yes (DE version will be created)`);

      // Wait 2 seconds between requests to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Failed: ${topic.title}`);
      console.error(`   Error: ${errorMsg}`);
      results.errors.push({
        topic: topic.title,
        error: errorMsg,
      });
    }
  }

  console.log('\n\n🎉 Scheduled blog posts creation completed!');
  console.log(`\n📊 Results:`);
  console.log(`   ✅ Created: ${results.created.length}`);
  console.log(`   ❌ Errors: ${results.errors.length}`);

  if (results.errors.length > 0) {
    console.log('\n⚠️  Errors:');
    results.errors.forEach(err => {
      console.log(`   - ${err.topic}: ${err.error}`);
    });
  }

  console.log('\n📅 Publication Schedule:');
  blogTopics.forEach(topic => {
    console.log(`   ${topic.scheduledDate.toLocaleDateString('cs-CZ')}: ${topic.title}`);
  });

  console.log('\n🤖 Auto-translation:');
  console.log('   - All articles will auto-create DE (German) drafts when published');
  console.log('   - You can review and edit DE drafts before publishing');

  console.log('\n🕐 Cron Job:');
  console.log('   - Runs every 15 minutes');
  console.log('   - Articles will be published at their scheduled time');
  console.log('   - Check Vercel Dashboard → Cron Jobs for status');
}

// Run the script
createScheduledBlogPosts();
