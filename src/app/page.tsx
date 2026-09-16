import { Button } from '@/components/ui/button';
import { ArrowRight, Calculator, MessageSquare, Receipt } from 'lucide-react';
import Link from 'next/link';
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
        <section className="flex flex-col items-center gap-5 pt-20 pb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight max-w-2xl">
            Split any bill, fairly, in seconds
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            Itemize what everyone ordered, account for discounts and tax, and see exactly who owes
            what — no spreadsheets required.
          </p>
          <Link href="/split">
            <Button size="lg" className="gap-2">
              Get Started
              <ArrowRight size={20} />
            </Button>
          </Link>
        </section>

        <section className="grid sm:grid-cols-3 gap-6 pb-20 w-full text-left">
          {features.map(({ icon: Icon, title, description, badge }) => (
            <div
              key={title}
              className="flex flex-col gap-3 rounded-lg border border-border bg-card p-6"
            >
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
          <h2 className="text-2xl font-semibold">Ready to split your first bill?</h2>
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
