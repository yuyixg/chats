'use client';

import * as React from 'react';

import { useTheme } from 'next-themes';

import { IconMoon, IconSun } from '@/components/Icons';
import { Button } from '@/components/ui/button';

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <Button variant="ghost" size="icon" className="hover:bg-none">
      <IconSun
        onClick={() => setTheme('dark')}
        className="h-[22px] w-[22px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
        stroke="#7d7d7d"
      />
      <IconMoon
        onClick={() => setTheme('light')}
        className="absolute h-[22px] w-[22px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
        stroke="#7d7d7d"
      />
    </Button>
  );
}
