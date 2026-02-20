/**
 * Cron API Endpoint: Publish Scheduled Blog Posts
 *
 * This endpoint is called by Vercel Cron to automatically publish blog posts
 * that have reached their scheduled publication date.
 *
 * It also creates AI translations if autoTranslate is enabled.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getScheduledPostsReadyToPublish,
  updateBlogPost,
  createBlogPost,
} from '@/lib/turso/blog';
import { createTranslatedDraft } from '@/lib/ai/blog-translator';
import type { BlogLanguage } from '@/types/blog';

// Verify that the request is coming from Vercel Cron
function verifyCronRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('CRON_SECRET is not configured');
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  // Verify cron request
  if (!verifyCronRequest(request)) {
    console.error('Unauthorized cron request');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Get all posts scheduled for publication
    const scheduledPosts = await getScheduledPostsReadyToPublish();

    const results = {
      published: [] as string[],
      translations: [] as string[],
      errors: [] as { postId: string; error: string }[],
    };

    for (const post of scheduledPosts) {
      try {
        // Publish the post
        await updateBlogPost(post.id, {
          published: true,
          publishedAt: new Date(),
          scheduledDate: undefined, // Clear scheduled date
        });

        results.published.push(post.id);

        // Create translation if auto-translate is enabled
        if (post.autoTranslate) {
          try {
            const targetLanguage: BlogLanguage = post.language === 'cs' ? 'de' : 'cs';

            const translatedDraft = await createTranslatedDraft(post, targetLanguage);
            const newTranslation = await createBlogPost(translatedDraft);

            results.translations.push(newTranslation.id);
          } catch (translationError) {
            const errorMsg = translationError instanceof Error
              ? translationError.message
              : 'Unknown translation error';
            console.error(`Translation failed for ${post.id}:`, errorMsg);
            results.errors.push({
              postId: post.id,
              error: `Translation failed: ${errorMsg}`,
            });
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Failed to publish ${post.id}:`, errorMsg);
        results.errors.push({
          postId: post.id,
          error: errorMsg,
        });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Cron job failed:', errorMsg);

    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Also support POST method
export const POST = GET;

// Configure as an edge function for faster cold starts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max execution time
