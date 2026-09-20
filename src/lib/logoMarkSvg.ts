import { siteConfig } from './siteConfig';

// The same geometry as <LogoMark />, as a standalone SVG data URI.
//
// The React component can't be reused here: it paints with
// `hsl(var(--primary))`, and both consumers of this helper (the OG image and
// the Apple touch icon) render through Satori, which has no CSS custom
// properties and no stylesheet to read them from. So the brand colour is
// resolved from siteConfig instead.
//
// A data URI rather than a file in /public because an absolute URL would have
// to be fetched over the network at render time — a needless failure mode for
// an image whose source we already have.
export function logoMarkDataUri({ rounded = true }: { rounded?: boolean } = {}) {
  // iOS applies its own mask to touch icons, so a pre-rounded square there
  // would be clipped twice and look inset.
  const clip = rounded
    ? '<defs><clipPath id="c"><rect width="64" height="64" rx="16"/></clipPath></defs>'
    : '<defs><clipPath id="c"><rect width="64" height="64"/></clipPath></defs>';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  ${clip}
  <g clip-path="url(#c)">
    <polygon points="0,0 64,0 0,64" fill="${siteConfig.brandColor}"/>
    <polygon points="64,0 64,64 0,64" fill="${siteConfig.brandColor}" fill-opacity="0.55"/>
    <line x1="64" y1="0" x2="0" y2="64" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.85"/>
  </g>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
