import { ImageResponse } from 'next/og';
import { siteConfig } from '@/lib/siteConfig';
import { logoMarkDataUri } from '@/lib/logoMarkSvg';

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// No custom font is loaded on purpose. ImageResponse ships with a bundled
// sans-serif, and fetching Newsreader/Geist from Google Fonts here would add a
// build-time network call that can fail the render for a purely decorative
// gain — the app's everyday UI font is a sans anyway; the serif is reserved for
// receipt exports.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: siteConfig.backgroundColor,
          position: 'relative',
        }}
      >
        {/* Soft brand wash in the top-right for depth. Satori has no blur, so
            this is a plain low-opacity circle bled off the canvas edge. */}
        <div
          style={{
            position: 'absolute',
            top: -260,
            right: -200,
            width: 720,
            height: 720,
            borderRadius: 720,
            background: siteConfig.brandColor,
            opacity: 0.08,
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoMarkDataUri()} width={64} height={64} alt="" />
          <div
            style={{
              marginLeft: 20,
              fontSize: 34,
              fontWeight: 600,
              color: '#1F2433',
              letterSpacing: -0.5,
            }}
          >
            {siteConfig.name}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: -2.5,
              color: '#1F2433',
              maxWidth: 900,
            }}
          >
            {siteConfig.tagline}
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 30,
              lineHeight: 1.45,
              color: '#5C6477',
              maxWidth: 860,
            }}
          >
            {siteConfig.description}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          {['Itemized splitting', 'Tax & discounts', 'PDF / CSV export', 'No sign-up'].map(
            (chip) => (
              <div
                key={chip}
                style={{
                  display: 'flex',
                  marginRight: 14,
                  padding: '10px 22px',
                  borderRadius: 999,
                  fontSize: 22,
                  fontWeight: 500,
                  color: siteConfig.brandColor,
                  background: '#FFFFFF',
                  border: `1px solid ${siteConfig.brandColor}33`,
                }}
              >
                {chip}
              </div>
            )
          )}
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: 14,
            background: siteConfig.brandColor,
          }}
        />
      </div>
    ),
    size
  );
}
