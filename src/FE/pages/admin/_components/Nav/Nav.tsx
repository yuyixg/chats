'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';

import { buttonVariants } from '@/components/ui/button';

import { cn } from '@/lib/utils';

interface IMenu {
  title: string;
  icon: (stroke?: string, size?: number) => JSX.Element;
  url: string;
}

interface NavProps {
  menus: IMenu[];
}

function Nav({ menus }: NavProps) {
  const router = useRouter();
  const active = (link: IMenu) => {
    const { url } = link;
    return url === router.pathname;
  };

  return (
    <div className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2">
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {menus.map((menu, index) => (
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
              'justify-start',
            )}
          >
            <span className="mr-2">
              {menu.icon(active(menu) ? 'white' : '')}
            </span>
            {menu.title}
          </Link>
        ))}
      </nav>
    </div>
  );
}
export default Nav;
