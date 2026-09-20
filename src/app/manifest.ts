import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/siteConfig';

// No custom install prompt accompanies this manifest, deliberately. Next's own
// PWA guide advises against `beforeinstallprompt` buttons because they aren't
// cross-platform — Safari on iOS never fires the event, so the button is either
// dead or needs separate "Share → Add to Home Screen" copy. Browsers already
// surface install natively once a valid manifest is served, and the landing
// page states the capability instead of interrupting to ask for it.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: 'Split Bill',
    description: siteConfig.description,
    // Someone who installs this wants the tool, not the marketing page.
    start_url: '/split',
    // Kept at the origin root rather than '/split' so the landing page stays
    // inside the installed app's scope — otherwise following a link back to
    // '/' would kick the user out into a browser tab.
    scope: '/',
    id: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: siteConfig.backgroundColor,
    theme_color: siteConfig.backgroundColor,
    categories: ['finance', 'productivity', 'utilities'],
    // 'any' and 'maskable' are separate artwork, not the same file listed
    // twice — see the note in lib/pwaIconResponse.tsx. Both sizes are provided
    // for each purpose because installers pick by size and silently fall back
    // to scaling when the one they want is missing.
    icons: [
      { src: '/pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/pwa-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    // Android shows these in the install dialog, which turns a bare
    // "Install this app?" prompt into something that actually previews the
    // product. Reuses the screenshots the README already maintains.
    screenshots: [
      {
        src: '/screenshot-split-mobile.png',
        sizes: '480x743',
        type: 'image/png',
        form_factor: 'narrow',
      },
      {
        src: '/screenshot-split-desktop.png',
        sizes: '1400x500',
        type: 'image/png',
        form_factor: 'wide',
      },
    ],
  };
}
