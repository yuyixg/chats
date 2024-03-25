import { Nav } from '@/components/Admin/Nav/Nav';
import { ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
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
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const AdminLayout = ({
  children,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const router = useRouter();
  const { t } = useTranslation('admin');
  const [isCollapsed, setIsCollapsed] = useState(false);
  let defaultLayout = [265, 1095];

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

  useEffect(() => {
    document.title = 'Chats Admin';
  }, []);

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
      </TooltipProvider>
    </>
  );
};

export default AdminLayout;
