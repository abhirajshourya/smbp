import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/siteConfig';

export default function robots(): MetadataRoute.Robots {
  // Preview deployments get their own public URL and would otherwise be
  // crawlable duplicates of production. The canonical tag already points them
  // home, but a canonical is a hint — a blanket disallow on non-production
  // builds is the part crawlers actually have to honour.
  const isProduction = process.env.VERCEL_ENV === 'production' || !process.env.VERCEL_ENV;

  if (!isProduction) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }

  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
