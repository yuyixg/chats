'use client';

import * as React from 'react';

import { useTheme } from 'next-themes';

import { IconMoon, IconSun } from '@/components/Icons';
import { Button } from '@/components/ui/button';

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <Button className="hover:bg-transparent p-0 m-0 bg-transparent">
      <IconSun
        size={24}
        onClick={() => setTheme('dark')}
        className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
      />
      <IconMoon
        size={24}
        onClick={() => setTheme('light')}
        className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
      />
    </Button>
  );
}
