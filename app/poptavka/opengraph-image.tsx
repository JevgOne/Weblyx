import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Nezávazná poptávka webu - Ozveme se do 24 hodin | Weblyx';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
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
            backgroundImage: `radial-gradient(circle at 25px 25px, #14B8A6 2%, transparent 0%),
                              radial-gradient(circle at 75px 75px, #14B8A6 2%, transparent 0%)`,
            backgroundSize: '100px 100px',
          }}
        />

        {/* Logo/Brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              background: '#14B8A6',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            W
          </div>
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: 'white',
              letterSpacing: '-0.02em',
            }}
          >
            Weblyx
          </div>
        </div>

        {/* Main Heading */}
        <div
          style={{
            fontSize: '72px',
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            lineHeight: 1.1,
            marginBottom: '32px',
            maxWidth: '900px',
          }}
        >
          Nezávazná poptávka
        </div>

        {/* Subheading */}
        <div
          style={{
            fontSize: '36px',
            color: '#94a3b8',
            textAlign: 'center',
            marginBottom: '48px',
            lineHeight: 1.3,
          }}
        >
          Rychlý formulář • Odpověď do 24 hodin • Zdarma
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: '32px',
            marginBottom: '48px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(20, 184, 166, 0.1)',
              padding: '16px 32px',
              borderRadius: '12px',
              border: '2px solid #14B8A6',
            }}
          >
            <div
              style={{
                fontSize: '28px',
                color: '#14B8A6',
              }}
            >
              ✓
            </div>
            <div
              style={{
                fontSize: '24px',
                fontWeight: '600',
                color: 'white',
              }}
            >
              Pouze 6 polí
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(20, 184, 166, 0.1)',
              padding: '16px 32px',
              borderRadius: '12px',
              border: '2px solid #14B8A6',
            }}
          >
            <div
              style={{
                fontSize: '28px',
                color: '#14B8A6',
              }}
            >
              ⚡
            </div>
            <div
              style={{
                fontSize: '24px',
                fontWeight: '600',
                color: 'white',
              }}
            >
              30 sekund
            </div>
          </div>
        </div>

        {/* CTA */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#14B8A6',
            padding: '24px 48px',
            borderRadius: '12px',
          }}
        >
          <div
            style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            Získat cenovou nabídku →
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: '24px',
            color: '#64748b',
          }}
        >
          weblyx.cz/poptavka
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
