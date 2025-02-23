'use client';

import { GithubOriginal, LinkedinOriginal } from 'devicons-react';
import React from 'react';
import { ArrowUp, Mail } from 'lucide-react';
import { Button } from './ui/button';

export const Footer = () => {
  return (
    <footer className="max-w-4xl mx-auto p-8 md:max-w-full md:mx-0 border-0 border-t-2 border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4">
          <a
            href="https://linkedin.com/in/abhirajshourya"
            target="_blank"
            rel="noopener noreferrer"
          >
            <LinkedinOriginal
              className="text-neutral-600 dark:text-neutral-300 hover:text-blue-700"
              size={24}
            />
          </a>
          <a href="https://github.com/abhirajshourya" target="_blank" rel="noopener noreferrer">
            <GithubOriginal
              className="text-neutral-600 dark:text-neutral-300 hover:text-gray-800 dark:invert"
              size={24}
            />
          </a>
          <a href="mailto:abhirajshourya@gmail.com" target="_blank" rel="noopener noreferrer">
            <Mail className="text-neutral-600 dark:text-neutral-300 hover:text-red-700" size={24} />
          </a>
        </div>
        <div className="flex gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <ArrowUp className="h-[1.2rem] w-[1.2rem] transition-all" />
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <p className="">thanks for stopping by!</p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Made with{' '}
          <a
            href="https://nextjs.org/"
            className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-violet-700 font-semibold dark:to-violet-700 dark:from-blue-700"
          >
            Next.js
          </a>{' '}
          by Abhiraj Shourya
        </p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          &copy; {new Date().getFullYear()} Abhiraj Shourya. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
