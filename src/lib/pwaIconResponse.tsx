import { ImageResponse } from 'next/og';
import { logoMarkDataUri, pwaIconDataUri } from './logoMarkSvg';

// Shared by the install-icon routes. Generated rather than committed as binary
// PNGs so they can't drift out of sync with <LogoMark />, the OG image and the
// Apple touch icon — all of which now render from the one geometry in
// logoMarkSvg.ts.
//
// The routes are named `pwa-*.png` so the manifest points at URLs ending in
// .png. Install tooling is inconsistent about trusting the manifest's `type`
// field over the URL's extension, and a route segment containing a dot is a
// supported Next convention (it's how `robots.txt/route.ts` works).
//
// 'any' and 'maskable' are genuinely different artwork, not the same file
// listed twice: a maskable icon is cropped to an arbitrary platform shape and
// so has to sit inset on a filled background, which looks needlessly padded in
// the unmasked contexts 'any' covers.
export function pwaIconResponse(size: number, purpose: 'any' | 'maskable') {
  const src = purpose === 'maskable' ? pwaIconDataUri() : logoMarkDataUri();

  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={size} height={size} alt="" />
      </div>
    ),
    { width: size, height: size }
  );
}
