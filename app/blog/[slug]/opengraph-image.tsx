import { ImageResponse } from 'next/og';
import { getBlogPostBySlug } from '@/lib/turso/blog';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'Weblyx Blog';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

// Image generation
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const post = await getBlogPostBySlug(slug);

    if (!post) {
      throw new Error('Post not found');
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: '80px',
            position: 'relative',
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              backgroundImage: 'radial-gradient(circle at 25% 25%, #14B8A6 0%, transparent 50%), radial-gradient(circle at 75% 75%, #14B8A6 0%, transparent 50%)',
            }}
          />

          {/* Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              zIndex: 1,
            }}
          >
            {/* Badge */}
            <div
              style={{
                display: 'inline-flex',
                padding: '12px 24px',
                background: 'rgba(20, 184, 166, 0.1)',
                borderRadius: '12px',
                border: '2px solid rgba(20, 184, 166, 0.3)',
                fontSize: '24px',
                color: '#14B8A6',
                fontWeight: 'bold',
              }}
            >
              📝 Blog
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: '56px',
                fontWeight: 'bold',
                color: 'white',
                lineHeight: 1.2,
                maxWidth: '900px',
              }}
            >
              {post.title}
            </div>

            {/* Excerpt */}
            {post.excerpt && (
              <div
                style={{
                  fontSize: '24px',
                  color: '#94a3b8',
                  maxWidth: '900px',
                  lineHeight: 1.4,
                }}
              >
                {post.excerpt.substring(0, 150)}{post.excerpt.length > 150 ? '...' : ''}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              zIndex: 1,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  background: '#14B8A6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: 'white',
                }}
              >
                W
              </div>
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: 'white',
                }}
              >
                Weblyx
              </div>
            </div>
            {post.authorName && (
              <div
                style={{
                  fontSize: '24px',
                  color: '#64748b',
                }}
              >
                {post.authorName}
              </div>
            )}
          </div>
        </div>
      ),
      {
        ...size,
      }
    );
  } catch (error) {
    // Fallback OG image
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          }}
        >
          <div
            style={{
              fontSize: '64px',
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            Weblyx Blog
          </div>
        </div>
      ),
      {
        ...size,
      }
    );
  }
}
