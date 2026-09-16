import { Button } from '@/components/ui/button';
import { ArrowRight, Calculator, MessageSquare, Receipt, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { CustomNav } from '@/components/CustomNav';

const features = [
  {
    icon: Calculator,
    title: 'Itemized splitting',
    description:
      'Add items with quantity, discount, and tax, then assign each person their exact share — down to the cent.',
    badge: null,
  },
  {
    icon: Receipt,
    title: 'Receipt scan auto-fill',
    description:
      'Snap a photo of a receipt and let AI fill in the line items for you, ready to review before it’s added.',
    badge: 'Coming soon',
  },
  {
    icon: MessageSquare,
    title: 'Natural language edits',
    description:
      '“Split the pizza evenly between Alice and Bob” — just type it, no clicking through dropdowns.',
    badge: 'Coming soon',
  },
];

export default function Home() {
  return (
    <div>
      <CustomNav />
      <div className="flex flex-col items-center text-center max-w-5xl mx-auto px-6">
        <section className="flex flex-col items-center gap-6 pt-20 md:pt-28 pb-16 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 rounded-full px-3 py-1">
            <Sparkles size={13} />
            Free forever, no sign-up
          </span>
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05] max-w-3xl text-balance">
            Split any bill, fairly, in seconds
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl text-balance">
            Itemize what everyone ordered, account for discounts and tax, and see exactly who owes
            what — no spreadsheets required.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-2 mt-2">
            <Link href="/split">
              <Button size="lg" className="gap-2">
                Split a bill free
                <ArrowRight size={20} />
              </Button>
            </Link>
            <Link href="#preview">
              <Button size="lg" variant="ghost" className="gap-1 text-muted-foreground">
                See how it works
              </Button>
            </Link>
          </div>
        </section>

        <section
          id="preview"
          className="w-full pb-24 scroll-mt-24 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-1000"
        >
          <div className="rounded-2xl border border-border bg-card p-2 shadow-xl">
            <Image
              src="/screenshot-split-desktop.png"
              alt="An itemized bill in Split My Bill Plz, showing three items split between three people with each share calculated automatically"
              width={1400}
              height={875}
              className="rounded-xl w-full h-auto"
              priority
            />
          </div>
        </section>

        <section className="grid sm:grid-cols-3 gap-x-8 gap-y-10 pb-24 w-full text-left">
          {features.map(({ icon: Icon, title, description, badge }) => (
            <div key={title} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10 text-primary">
                  <Icon size={20} />
                </div>
                {badge && (
                  <span className="text-xs font-medium text-warning-foreground bg-warning/20 rounded-full px-2 py-0.5">
                    {badge}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-base">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </section>

        <section className="flex flex-col items-center gap-4 pb-24">
          <h2 className="text-2xl font-semibold tracking-tight">Ready to split your first bill?</h2>
          <Link href="/split">
            <Button size="lg" variant="outline" className="gap-2">
              Try it now, no sign-up needed
              <ArrowRight size={18} />
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
}
