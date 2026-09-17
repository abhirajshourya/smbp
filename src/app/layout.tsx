import type { Metadata } from 'next';
import { Geist, Geist_Mono, Newsreader } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import { Footer } from '@/components/Footer';

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
  title: 'Split My Bill Plz!',
  description:
    'An Application to split bills with friends with itemization, tax, tip, discounts, and more.',
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
