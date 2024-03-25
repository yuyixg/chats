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

interface ILink {
  title: string;
  icon: JSX.Element;
  url: string;
}

interface NavProps {
  isCollapsed: boolean;
  links: ILink[];
}

export function Nav({ links, isCollapsed }: NavProps) {
  const router = useRouter();
  const active = (link: ILink) => {
    const { url } = link;
    return url === router.pathname;
  };

  return (
    <div
      data-collapsed={isCollapsed}
      className='group flex flex-col gap-4 py-2'
    >
      <nav className='grid gap-2 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2'>
        {links.map((link, index) =>
          isCollapsed ? (
            <Tooltip key={index} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={link.url}
                  className={cn(
                    buttonVariants({
                      variant: active(link) ? 'default' : 'ghost',
                      size: 'icon',
                    }),
                    'h-9 w-9 flex',
                    active(link)
                      ? 'dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white'
                      : ''
                  )}
                >
                  <span>{link.icon}</span>
                  <span className='sr-only'>{link.title}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side='right' className='flex items-center gap-4'>
                {link.title}
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              key={index}
              href={link.url}
              className={cn(
                buttonVariants({
                  variant: active(link) ? 'default' : 'ghost',
                  size: 'sm',
                }),
                active(link)
                  ? 'dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white'
                  : '',
                'justify-start'
              )}
            >
              <span className='mr-2'>{link.icon}</span>
              {link.title}
            </Link>
          )
        )}
      </nav>
    </div>
  );
}
