/**
 * AI Blog Translation Service
 *
 * Translates blog posts between Czech (CS) and German (DE) using Claude AI
 */

import Anthropic from '@anthropic-ai/sdk';
import type { BlogPost, BlogLanguage, CreateBlogPostData } from '@/types/blog';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface TranslationResult {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  metaTitle?: string;
  metaDescription?: string;
}

/**
 * Translate a blog post from one language to another
 */
export async function translateBlogPost(
  post: BlogPost,
  targetLanguage: BlogLanguage
): Promise<TranslationResult> {
  const sourceLanguage = post.language;

  if (sourceLanguage === targetLanguage) {
    throw new Error('Source and target languages must be different');
  }

  const sourceLangName = sourceLanguage === 'cs' ? 'Czech' : 'German';
  const targetLangName = targetLanguage === 'cs' ? 'Czech' : 'German';

  const prompt = `You are a professional translator specializing in web content and SEO.

Translate the following blog post from ${sourceLangName} to ${targetLangName}.

IMPORTANT RULES:
1. Maintain the same tone, style, and formatting (markdown, HTML tags, etc.)
2. Keep technical terms and product names in their original form
3. Translate SEO meta fields to be natural and keyword-optimized in the target language
4. For the slug: create a URL-friendly version in the target language (lowercase, hyphens, no special characters)
5. Preserve all markdown formatting, links, and code blocks exactly

SOURCE BLOG POST:
---
Title: ${post.title}
Slug: ${post.slug}
Excerpt: ${post.excerpt || 'N/A'}
Meta Title: ${post.metaTitle || 'N/A'}
Meta Description: ${post.metaDescription || 'N/A'}

Content:
${post.content}
---

Please return the translation in the following JSON format:
{
  "title": "translated title",
  "slug": "translated-url-slug",
  "excerpt": "translated excerpt (2-3 sentences)",
  "metaTitle": "translated meta title (50-60 chars, SEO optimized)",
  "metaDescription": "translated meta description (150-160 chars, SEO optimized)",
  "content": "translated content with preserved formatting"
}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8000,
      temperature: 0.3, // Lower temperature for more consistent translations
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract JSON from response
    const textContent = response.content[0];
    if (textContent.type !== 'text') {
      throw new Error('Unexpected response format from Claude');
    }

    // Parse JSON response (remove markdown code blocks if present)
    let jsonText = textContent.text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const translation: TranslationResult = JSON.parse(jsonText);

    // Validate required fields
    if (!translation.title || !translation.slug || !translation.content) {
      throw new Error('Translation missing required fields');
    }

    return translation;
  } catch (error) {
    console.error('Blog translation error:', error);
    throw new Error(`Failed to translate blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create a translated blog post draft
 */
export async function createTranslatedDraft(
  originalPost: BlogPost,
  targetLanguage: BlogLanguage
): Promise<CreateBlogPostData> {
  const translation = await translateBlogPost(originalPost, targetLanguage);

  return {
    title: translation.title,
    slug: translation.slug,
    content: translation.content,
    excerpt: translation.excerpt,
    metaTitle: translation.metaTitle,
    metaDescription: translation.metaDescription,
    authorId: originalPost.authorId,
    authorName: originalPost.authorName,
    featuredImage: originalPost.featuredImage, // Keep same image
    tags: originalPost.tags, // Keep same tags (or translate separately if needed)
    published: false, // Create as draft
    language: targetLanguage,
    parentPostId: originalPost.id, // Link to original post
    autoTranslate: false, // Disable auto-translate for translated posts
    scheduledDate: originalPost.scheduledDate, // Keep same scheduled date
  };
}
