import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Newsreader } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import { Footer } from '@/components/Footer';
import { siteConfig } from '@/lib/siteConfig';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Editorial serif reserved for the receipt exports' brand header — an
// accent moment, not the app's everyday UI font.
const receiptSerif = Newsreader({
  variable: '--font-receipt-serif',
  subsets: ['latin'],
  weight: ['500'],
});

export const metadata: Metadata = {
  // Makes every relative URL below (and the generated OG image) resolve to an
  // absolute one. Without it Next warns at build time and social crawlers get
  // relative og:image paths they can't fetch.
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name}!`,
    // Child routes set only their own title; this frames it. Keeps the brand
    // in the tab and in search results without every page repeating it.
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    'bill splitter',
    'split the bill',
    'itemized bill split',
    'split expenses with friends',
    'restaurant bill calculator',
    'group expense calculator',
  ],
  authors: [{ name: 'Abhiraj Shourya', url: 'https://github.com/abhirajshourya' }],
  creator: 'Abhiraj Shourya',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

// Next 16 wants viewport concerns declared separately from `metadata`.
// Deliberately no `maximumScale`/`userScalable` — pinning zoom is an
// accessibility regression, and this app has a lot of small numeric inputs
// people will legitimately want to zoom into.
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: siteConfig.backgroundColor },
    { media: '(prefers-color-scheme: dark)', color: siteConfig.backgroundColorDark },
  ],
  colorScheme: 'light dark',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${receiptSerif.variable} antialiased`}>
        <div>{children}</div>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
