// Single source of truth for anything that needs an absolute URL: metadataBase,
// canonical links, OG image URLs, sitemap entries, robots. Kept in one place so
// moving to a custom domain later is a one-line change rather than a hunt
// through every metadata file.
//
// Resolution order matters:
//   1. NEXT_PUBLIC_SITE_URL — an explicit override; set this once a real domain
//      exists and it wins everywhere.
//   2. VERCEL_PROJECT_PRODUCTION_URL — Vercel injects the *production* domain
//      even when building a preview deployment. That's exactly what canonical
//      URLs want: previews should point search engines at production rather
//      than competing with it for the same content.
//   3. localhost — dev only.
function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return 'http://localhost:3000';
}

export const siteConfig = {
  name: 'Split My Bill Plz',
  // Used as the OG/Twitter title and the JSON-LD name. Deliberately different
  // from the browser tab title, which carries the "!" and reads as an app
  // label rather than a shareable headline.
  tagline: 'Split any bill, fairly, in seconds',
  description:
    'Itemize what everyone ordered, account for discounts and tax, and see exactly who owes what — no spreadsheets, no sign-up required.',
  url: resolveSiteUrl(),
  // The brand indigo, resolved from the --primary token in globals.css
  // (hsl(243 75% 59%)). Hard-coded as hex because neither the OG image
  // renderer nor the theme-color meta tag can read CSS custom properties.
  brandColor: '#5048E5',
  // The lighter half of the logo mark's diagonal split. A literal hex rather
  // than the brand colour at reduced opacity, so the mark renders identically
  // whatever sits behind it — src/app/icon.svg has always used this value and
  // the generated marks now match it exactly.
  brandLight: '#8B85F0',
  // --background resolved for each theme, for the theme-color meta tag so the
  // mobile browser chrome matches the page instead of flashing white.
  backgroundColor: '#F9FAFB',
  backgroundColorDark: '#0F121A',
} as const;
