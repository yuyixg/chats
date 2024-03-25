import { Nav } from '@/components/Admin/Nav/Nav';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  IconChartPie,
  IconMessageCircle,
  IconMessages,
  IconSettingsCog,
  IconUserCog,
  IconUsers,
} from '@tabler/icons-react';
import { ArchiveX, Inbox, Send, Trash2 } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useState } from 'react';

const AdminLayout = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const router = useRouter();
  const { t } = useTranslation('admin');
  const [isCollapsed, setIsCollapsed] = useState(false);
  let defaultLayout = [265, 1095];

  const activeClass = (pathName: string) => {
    return pathName === router.pathname
      ? 'bg-gray-100 shadow-sm text-700'
      : 'text-gray-600';
  };

  const links = [
    {
      url: '/admin/dashboard',
      icon: <IconChartPie stroke={1.6} size={22} />,
      title: t('Dashboard'),
    },
    {
      url: '/admin/models',
      icon: <IconSettingsCog stroke={1.6} size={22} />,
      title: t('Model Configs'),
    },
    {
      url: '/admin/users',
      icon: <IconUsers stroke={1.6} size={22} />,
      title: t('User Management'),
    },
    {
      url: '/admin/user-models',
      icon: <IconUserCog stroke={1.6} size={22} />,
      title: t('User Models'),
    },
    {
      url: '/admin/messages',
      icon: <IconMessages stroke={1.6} size={22} />,
      title: t('User Messages'),
    },
    {
      url: '/',
      icon: <IconMessageCircle stroke={1.6} size={22} />,
      title: 'Chats',
    },
  ];

  const MenuItem = (props: {
    url: string;
    icon: JSX.Element;
    name: string;
  }) => {
    const { url, icon, name } = props;
    return (
      <li key={url}>
        <a
          onClick={() => {
            router.push(url);
          }}
          className={`flex items-center p-2 cursor-pointer rounded-lg hover:bg-gray-100 hover:text-gray-700 group ${activeClass(
            url
          )}`}
        >
          {icon}
          <span className='ms-3'>{name}</span>
        </a>
      </li>
    );
  };

  return (
    <>
      <TooltipProvider delayDuration={0}>
        <ResizablePanelGroup
          direction='horizontal'
          className='h-full w-full items-stretch'
        >
          <ResizablePanel
            defaultSize={defaultLayout[0]}
            collapsedSize={10}
            collapsible={true}
            minSize={8}
            maxSize={12}
            className={cn(
              isCollapsed && 'transition-all duration-300 ease-in-out',
              'h-full'
            )}
          >
            <div className='px-3 py-4 overflow-y-auto'>
              <a
                onClick={() => {
                  router.push('/admin/dashboard');
                }}
                className='flex items-center ps-1 mb-1 cursor-pointer'
              >
                <img
                  className='h-8 me-3 rounded-sm'
                  alt='chats Logo'
                  src='/chats.png'
                />
                <span className='self-center text-md font-medium whitespace-nowrap'>
                  Chats
                </span>
              </a>
            </div>
            <Nav isCollapsed={isCollapsed} links={links} />
          </ResizablePanel>
          {/* <ResizableHandle withHandle /> */}
          <ResizablePanel
            defaultSize={defaultLayout[1]}
            maxSize={90}
            minSize={85}
          >
            <div className='p-4'>{children}</div>
          </ResizablePanel>
        </ResizablePanelGroup>
        {/* <div className={className}>
        <aside className='fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0 shadow-medium border-r'>
          <div className='h-full px-3 py-4 overflow-y-auto bg-white'>
            <a
              onClick={() => {
                router.push('/admin/dashboard');
              }}
              className='flex items-center ps-1 mb-5'
            >
              <img
                className='h-8 me-3 rounded-sm'
                alt='chats Logo'
                src='/chats.png'
              />
              <span className='self-center text-md font-medium whitespace-nowrap'>
                Chats
              </span>
            </a>
            <ul className='space-y-2 font-medium text-[14px]'>
              {menus.map((m) => {
                return MenuItem(m);
              })}
            </ul>
          </div>
        </aside>
        <div className='p-4 sm:ml-64'>{children}</div>
      </div> */}
      </TooltipProvider>
    </>
  );
};

export default AdminLayout;
