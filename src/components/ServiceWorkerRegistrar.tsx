'use client';

import { useEffect } from 'react';

// Registers public/sw.js. Renders nothing — it exists purely so the root
// layout can stay a Server Component.
//
// Registration is deferred to the window `load` event: a service worker
// install kicks off its own fetches for the shell, and doing that while the
// page is still loading competes with the page's own requests for bandwidth on
// exactly the slow connections the cache is meant to help.
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // Nothing to cache from a dev server, and a stale worker hanging around
    // between branches is a genuinely confusing thing to debug.
    if (process.env.NODE_ENV !== 'production') return;

    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // A failed registration costs the user nothing — the app works
        // normally without it — so this stays silent rather than logging an
        // error that looks like a real fault.
      });
    };

    if (document.readyState === 'complete') {
      register();
      return;
    }

    window.addEventListener('load', register);
    return () => window.removeEventListener('load', register);
  }, []);

  return null;
}
