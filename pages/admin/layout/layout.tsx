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
  IconCreditCard,
  IconFiles,
  IconKey,
  IconMessages,
  IconNotes,
  IconSettingsCog,
  IconShieldLock,
  IconUserCog,
  IconUsers,
} from '@/components/Icons/index';
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
      icon: (stroke?: string) => {
        return <IconChartPie stroke={stroke} />;
      },
      title: t('Dashboard'),
    },
    {
      url: '/admin/users',
      icon: (stroke?: string) => {
        return <IconUsers stroke={stroke} />;
      },
      title: t('User Management'),
    },
    {
      url: '/admin/user-models',
      icon: (stroke?: string) => {
        return <IconUserCog stroke={stroke} />;
      },
      title: t('User Models'),
    },
    {
      url: '/admin/model-keys',
      icon: (stroke?: string) => {
        return <IconKey stroke={stroke} />;
      },
      title: t('Model Keys'),
    },
    {
      url: '/admin/models',
      icon: (stroke?: string) => {
        return <IconSettingsCog stroke={stroke} />;
      },
      title: t('Model Configs'),
    },
    {
      url: '/admin/file-service',
      icon: (stroke?: string) => {
        return <IconFiles stroke={stroke} />;
      },
      title: t('File Service'),
    },
    {
      url: '/admin/login-service',
      icon: (stroke?: string) => {
        return <IconShieldLock stroke={stroke} />;
      },
      title: t('Login Service'),
    },
    {
      url: '/admin/pay-service',
      icon: (stroke?: string) => {
        return <IconCreditCard stroke={stroke} />;
      },
      title: t('Pay Service'),
    },
    {
      url: '/admin/messages',
      icon: (stroke?: string) => {
        return <IconMessages stroke={stroke} />;
      },
      title: t('User Messages'),
    },
    {
      url: '/admin/request-logs',
      icon: (stroke?: string) => {
        return <IconNotes stroke={stroke} />;
      },
      title: t('Request Logs'),
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
                router.push('/');
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
