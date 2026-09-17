import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Calculator,
  FileDown,
  FileText,
  Gift,
  Image as ImageIcon,
  MessageSquare,
  Plane,
  Receipt,
  Share2,
  Sparkles,
  Table2,
  UtensilsCrossed,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { CustomNav } from '@/components/CustomNav';

const features = [
  {
    icon: Calculator,
    title: 'Itemized splitting',
    description:
      'Add items with quantity, discount, and tax, set a target bill total and watch it count down as you go, then assign each person their exact share — down to the cent.',
    badge: null,
  },
  {
    icon: Share2,
    title: 'Export & share',
    description:
      'Download a receipt-style PDF or image, export to CSV, or copy a plain-text summary to paste straight into a chat.',
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

const steps = [
  {
    title: 'Add your items',
    description: 'Type in what was ordered, with quantity, price, discount, and tax per line.',
  },
  {
    title: 'Add your people',
    description: 'Tap a name on any item to include them — the share divides evenly, automatically.',
  },
  {
    title: 'See who owes what',
    description: 'Totals update instantly as you go. No manual math, no arguments over the tip.',
  },
];

const exportFormats = [
  { icon: FileText, label: 'Plain-text summary, ready to paste into any chat' },
  { icon: Table2, label: 'CSV, for spreadsheets and expense tracking' },
  { icon: ImageIcon, label: 'Receipt-style image, easy to screenshot and send' },
  { icon: FileDown, label: 'Receipt-style PDF, for printing or archiving' },
];

const useCases = [
  { icon: UtensilsCrossed, label: 'Restaurant dinners' },
  { icon: Users, label: 'Roommate groceries' },
  { icon: Plane, label: 'Trip expenses' },
  { icon: Gift, label: 'Group gifts' },
];

const faqs = [
  {
    question: 'Do I need to create an account?',
    answer:
      'No. Split My Bill Plz works instantly in your browser — no sign-up, no email, nothing to install.',
  },
  {
    question: 'Is my data private?',
    answer:
      'Everything is stored locally in your browser. Nothing about your bill is sent to or kept on a server.',
  },
  {
    question: 'Is it really free?',
    answer: 'Yes — free forever. No premium tier, no usage limits, no credit card required.',
  },
  {
    question: 'What about the AI features?',
    answer:
      'Receipt scanning and chat-based edits are on the way, powered by a shared AI budget — so they’ll stay free too, with a fair monthly cap per person.',
  },
];

function GradientBackdrop() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -top-24 -left-24 w-[32rem] h-[32rem] rounded-full bg-primary/30 blur-[100px]" />
      <div className="absolute top-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-violet-400/30 blur-[100px]" />
      <div className="absolute top-[60rem] left-1/3 w-[26rem] h-[26rem] rounded-full bg-sky-300/25 blur-[100px]" />
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative">
      <GradientBackdrop />
      <div className="relative z-10">
      <CustomNav />
      <div className="flex flex-col items-center text-center max-w-5xl mx-auto px-6">
        <section className="flex flex-col items-center gap-6 pt-20 md:pt-28 pb-16 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-white/40 backdrop-blur-md border border-white/40 rounded-full px-3 py-1 shadow-sm shadow-black/[0.02]">
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
          <div className="rounded-2xl border border-white/30 bg-white/30 backdrop-blur-xl p-2 shadow-2xl shadow-black/[0.03]">
            <Image
              src="/screenshot-split-desktop.png"
              alt="An itemized bill in Split My Bill Plz, showing four items split between three people, a live bill-total tracker, and each share calculated automatically"
              width={1400}
              height={500}
              className="rounded-xl w-full h-auto"
              priority
            />
          </div>
        </section>

        <section className="w-full pb-24">
          <h2 className="text-3xl font-semibold tracking-tight mb-12">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-6 text-left">
            {steps.map(({ title, description }, index) => (
              <div
                key={title}
                className="flex flex-col gap-3 rounded-xl border border-white/30 bg-white/30 backdrop-blur-lg p-6 shadow-sm shadow-black/[0.02]"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  {index + 1}
                </div>
                <h3 className="font-semibold text-base">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-24 w-full text-left">
          {features.map(({ icon: Icon, title, description, badge }) => (
            <div
              key={title}
              className="flex flex-col gap-3 rounded-xl border border-white/30 bg-white/30 backdrop-blur-lg p-6 shadow-sm shadow-black/[0.02]"
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

        <section className="w-full pb-24">
          <div className="rounded-2xl border border-white/30 bg-white/30 backdrop-blur-xl p-6 md:p-10 shadow-sm shadow-black/[0.02]">
            <div className="grid md:grid-cols-2 gap-10 items-center text-left">
              <div className="flex flex-col gap-4">
                <h2 className="text-3xl font-semibold tracking-tight">Export your bill your way</h2>
                <p className="text-muted-foreground">
                  Once everyone&apos;s shares are settled, send it however works best — a
                  receipt-style PDF or image for the group chat, a CSV for your records, or a
                  quick text summary.
                </p>
                <ul className="flex flex-col gap-3 mt-2">
                  {exportFormats.map(({ icon: Icon, label }) => (
                    <li key={label} className="flex items-center gap-3 text-sm">
                      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary shrink-0">
                        <Icon size={16} />
                      </div>
                      {label}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-center">
                <div className="rounded-xl border border-white/30 bg-white p-3 shadow-xl shadow-black/[0.06] max-w-xs w-full">
                  <Image
                    src="/screenshot-receipt-export.png"
                    alt="A generated receipt for a dinner bill, showing itemized food and drinks with discount and tax tags, the total, and each person's share"
                    width={680}
                    height={886}
                    className="rounded-lg w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full pb-24">
          <h2 className="text-3xl font-semibold tracking-tight mb-12">Built for every kind of bill</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {useCases.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-3 rounded-xl border border-white/30 bg-white/30 backdrop-blur-lg p-6 shadow-sm shadow-black/[0.02]"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10 text-primary">
                  <Icon size={20} />
                </div>
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="w-full max-w-2xl pb-24 text-left">
          <h2 className="text-3xl font-semibold tracking-tight mb-8 text-center">
            Frequently asked questions
          </h2>
          <div className="flex flex-col divide-y divide-white/30 rounded-2xl border border-white/30 bg-white/30 backdrop-blur-lg px-6 shadow-sm shadow-black/[0.02]">
            {faqs.map(({ question, answer }) => (
              <details key={question} className="group py-5">
                <summary className="flex items-center justify-between gap-4 font-medium cursor-pointer list-none">
                  {question}
                  <span className="text-muted-foreground transition-transform group-open:rotate-45 shrink-0">
                    +
                  </span>
                </summary>
                <p className="text-sm text-muted-foreground mt-3">{answer}</p>
              </details>
            ))}
          </div>
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
    </div>
  );
}
