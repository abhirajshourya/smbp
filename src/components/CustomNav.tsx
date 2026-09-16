'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogoMark } from '@/components/LogoMark';

export const CustomNav = () => {
  return (
    <nav className="sticky top-0 z-50 flex justify-between items-center w-full border-b border-white/20 bg-white/40 backdrop-blur-xl px-6 py-3 shadow-sm shadow-black/[0.02]">
      <Link href="/" className="flex items-center gap-2.5">
        <LogoMark className="w-7 h-7 rounded-[7px]" />
        <span className="text-base md:text-lg font-semibold tracking-tight text-foreground">
          Split My Bill Plz
        </span>
      </Link>
      <Button variant="outline" size="sm">
        Sign in
      </Button>
    </nav>
  );
};
