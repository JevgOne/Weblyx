import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'Weblyx - Moderní tvorba webových stránek';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

// Image generation
export default async function Image() {
  const baseUrl = process.env.NEXT_PUBLIC_DOMAIN === 'seitelyx.de' ? 'https://seitelyx.de' : 'https://www.weblyx.cz';
  const brandName = process.env.NEXT_PUBLIC_DOMAIN === 'seitelyx.de' ? 'Seitelyx' : 'Weblyx';
  const title = process.env.NEXT_PUBLIC_DOMAIN === 'seitelyx.de'
    ? 'Website erstellen lassen | Festpreis ab 399€'
    : 'Tvorba webových stránek od 10 000 Kč (AKCE 7 990 Kč)';
  const subtitle = process.env.NEXT_PUBLIC_DOMAIN === 'seitelyx.de'
    ? 'Schneller als WordPress • DSGVO-konform • In 3-7 Tagen'
    : 'Web za týden • SEO zdarma • Načítání pod 2s';

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
          {/* Brand */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                background: '#14B8A6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: 'bold',
                color: 'white',
              }}
            >
              {brandName[0]}
            </div>
            <div
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: 'white',
              }}
            >
              {brandName}
            </div>
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
            {title}
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: '28px',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            {subtitle}
          </div>
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
              fontSize: '24px',
              color: '#64748b',
            }}
          >
            {baseUrl.replace('https://', '').replace('www.', '')}
          </div>
          <div
            style={{
              display: 'flex',
              gap: '24px',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: 'rgba(20, 184, 166, 0.1)',
                borderRadius: '12px',
                border: '2px solid rgba(20, 184, 166, 0.3)',
              }}
            >
              <div
                style={{
                  fontSize: '24px',
                  color: '#14B8A6',
                  fontWeight: 'bold',
                }}
              >
                ⚡ Next.js
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
