// X/Twitter's crawler falls back to og:image when twitter:image is absent, but
// declaring it explicitly avoids depending on that fallback. The card is
// identical, so this re-exports the Open Graph image rather than duplicating it.
export { default, alt, size, contentType } from './opengraph-image';
