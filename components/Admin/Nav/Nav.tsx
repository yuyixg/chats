'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { buttonVariants } from '@/components/ui/button';
import { useRouter } from 'next/router';

interface IMenu {
  title: string;
  icon: JSX.Element;
  url: string;
}

interface NavProps {
  isCollapsed: boolean;
  menus: IMenu[];
}

export function Nav({ menus, isCollapsed }: NavProps) {
  const router = useRouter();
  const active = (link: IMenu) => {
    const { url } = link;
    return url === router.pathname;
  };

  return (
    <div
      data-collapsed={isCollapsed}
      className='group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2'
    >
      <nav className='grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2'>
        {menus.map((menu, index) =>
          isCollapsed ? (
            <Tooltip key={index} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={menu.url}
                  className={cn(
                    buttonVariants({
                      variant: active(menu) ? 'default' : 'ghost',
                      size: 'icon',
                    }),
                    'h-9 w-9 flex',
                    active(menu)
                      ? 'dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white'
                      : ''
                  )}
                >
                  <span>{menu.icon}</span>
                  <span className='sr-only'>{menu.title}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side='right' className='flex items-center gap-4'>
                {menu.title}
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              key={index}
              href={menu.url}
              className={cn(
                buttonVariants({
                  variant: active(menu) ? 'default' : 'ghost',
                  size: 'sm',
                }),
                active(menu)
                  ? 'dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white'
                  : '',
                'justify-start'
              )}
            >
              <span className='mr-2'>{menu.icon}</span>
              {menu.title}
            </Link>
          )
        )}
      </nav>
    </div>
  );
}
