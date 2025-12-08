import { ImageResponse } from 'next/og';

// Image metadata
export const alt = 'Weblyx - Tvorba webových stránek od 10 000 Kč';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
        }}
      >
        {/* Logo/Brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #14B8A6 0%, #06B6D4 100%)',
              backgroundClip: 'text',
              color: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Weblyx
          </div>
        </div>

        {/* Main Headline */}
        <div
          style={{
            fontSize: '56px',
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            marginBottom: '24px',
            maxWidth: '900px',
            lineHeight: 1.2,
          }}
        >
          Tvorba webových stránek od 10 000 Kč
        </div>

        {/* Subheadline */}
        <div
          style={{
            fontSize: '32px',
            color: '#94A3B8',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: 1.4,
          }}
        >
          ⚡ Web do týdne • Nejrychlejší načítání • SEO zdarma
        </div>

        {/* CTA Badge */}
        <div
          style={{
            marginTop: '48px',
            display: 'flex',
            alignItems: 'center',
            background: 'linear-gradient(90deg, #14B8A6 0%, #06B6D4 100%)',
            padding: '16px 48px',
            borderRadius: '9999px',
            fontSize: '28px',
            fontWeight: 'bold',
            color: 'white',
          }}
        >
          AKCE: Od 7 990 Kč
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
