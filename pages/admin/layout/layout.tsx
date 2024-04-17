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
  IconFiles,
  IconKey,
  IconMessageCircle,
  IconMessages,
  IconNotes,
  IconSettingsCog,
  IconUserCog,
  IconUsers,
} from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Image from 'next/image';

const AdminLayout = ({
  children,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const router = useRouter();
  const { t } = useTranslation('admin');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menus = [
    {
      url: '/admin/dashboard',
      icon: <IconChartPie stroke={1.6} size={22} />,
      title: t('Dashboard'),
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
      url: '/admin/models',
      icon: <IconSettingsCog stroke={1.6} size={22} />,
      title: t('Model Configs'),
    },
    {
      url: '/admin/file-service',
      icon: <IconFiles stroke={1.6} size={22} />,
      title: t('File Service'),
    },
    {
      url: '/admin/login-service',
      icon: <IconKey stroke={1.6} size={22} />,
      title: t('Login Service'),
    },
    {
      url: '/admin/messages',
      icon: <IconMessages stroke={1.6} size={22} />,
      title: t('User Messages'),
    },
    {
      url: '/admin/request-logs',
      icon: <IconNotes stroke={1.6} size={22} />,
      title: t('Request Logs'),
    },
    {
      url: '/',
      icon: <IconMessageCircle stroke={1.6} size={22} />,
      title: 'Chats',
    },
  ];

  useEffect(() => {
    document.title = 'Chats Admin';
  }, []);

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction='horizontal'
        className='h-full w-full items-stretch'
      >
        <ResizablePanel
          defaultSize={160}
          collapsedSize={4}
          collapsible={true}
          minSize={8}
          maxSize={14}
          onCollapse={() => {
            setIsCollapsed(true);
          }}
          onExpand={() => {
            setIsCollapsed(false);
          }}
          className={cn(
            isCollapsed &&
              'min-w-[50px] transition-all duration-300 ease-in-out',
            'h-full'
          )}
        >
          <div
            className={cn('px-4 py-4 overflow-y-auto', isCollapsed && 'px-2')}
          >
            <a
              onClick={() => {
                router.push('/admin/dashboard');
              }}
              className={cn(
                'flex items-center cursor-pointer',
                isCollapsed && 'justify-center'
              )}
            >
              <Image
                className='h-8 w-8 rounded-sm'
                alt='Chats Logo'
                src='/chats.png'
                width={32}
                height={32}
              />
              <span
                hidden={isCollapsed}
                className='self-center text-lg font-medium whitespace-nowrap'
              >
                Chats
              </span>
            </a>
          </div>
          <Nav isCollapsed={isCollapsed} menus={menus} />
        </ResizablePanel>
        <ResizableHandle className='h-screen' withHandle />
        <ResizablePanel defaultSize={1000}>
          <div className='p-4'>{children}</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
};

export default AdminLayout;
