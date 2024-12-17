import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 gap-4">
      <h1 className="text-6xl font-bold">Split my bill plz!</h1>
      <Link href="/split">
        <Button>
          Get Started
          <ArrowRight size={24} />
        </Button>
      </Link>
    </div>
  );
}
