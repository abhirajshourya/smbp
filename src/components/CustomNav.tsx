'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const CustomNav = () => {
  return (
    <nav className="flex justify-between items-center w-full border-b border-border bg-card px-6 py-4">
      <Link href="/" className="text-xl md:text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-blue-500 to-indigo-700">
        Split My Bill Plz!
      </Link>
      <Button variant="outline" size="sm">
        Sign in
      </Button>
    </nav>
  );
};
