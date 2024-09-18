'use client';

import * as React from 'react';

import { useTranslation } from 'next-i18next';
import { useTheme } from 'next-themes';

import { IconMoon, IconSun } from '@/components/Icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ModeToggle() {
  const { t } = useTranslation('client');
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <IconSun
            className="h-[22px] w-[22px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
            stroke="#7d7d7d"
          />
          <IconMoon
            className="absolute h-[22px] w-[22px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
            stroke="#7d7d7d"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          {t('Light')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          {t('Dark')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          {t('System')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
