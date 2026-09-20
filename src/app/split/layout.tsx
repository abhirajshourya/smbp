import type { Metadata } from 'next';
import { siteConfig } from '@/lib/siteConfig';

// `split/page.tsx` is a Client Component ('use client'), and Next only reads a
// `metadata` export from Server Components — so /split's metadata lives in this
// thin server layout instead. It renders nothing of its own.
const title = 'Split a bill';
// The root layout's title.template only frames `title`; og:/twitter: titles are
// resolved separately and would otherwise share a link as a brandless
// "Split a bill".
const socialTitle = `${title} · ${siteConfig.name}`;
const description =
  'Add line items, quantities, discounts and tax, assign each person their share, and see exactly who owes what — then export it as a PDF, image, CSV or plain text.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/split' },
  openGraph: {
    url: '/split',
    title: socialTitle,
    description,
  },
  twitter: {
    title: socialTitle,
    description,
  },
};

export default function SplitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
