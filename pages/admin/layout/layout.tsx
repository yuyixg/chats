import {
  IconChartPie,
  IconLogout,
  IconMessageCircle,
  IconMessages,
  IconSettingsCog,
  IconUserCog,
  IconUsers,
} from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import {
  UserSession,
  clearUserSession,
  getLoginUrl,
  getUserSession,
} from '@/utils/user';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const AdminLayout = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const router = useRouter();
  const { t } = useTranslation('admin');
  const [user, setUser] = useState<UserSession | null>();

  useEffect(() => {
    setUser(getUserSession());
  }, []);

  const activeClass = (pathName: string) => {
    return pathName === router.pathname
      ? 'bg-gray-100 shadow-sm text-700'
      : 'text-gray-600';
  };

  const logout = () => {
    clearUserSession();
    router.push(getLoginUrl());
  };

  const menus = [
    {
      url: '/admin/dashboard',
      icon: <IconChartPie stroke={1.6} size={22} />,
      name: t('Dashboard'),
    },
    {
      url: '/admin/models',
      icon: <IconSettingsCog stroke={1.6} size={22} />,
      name: t('Model Configs'),
    },
    {
      url: '/admin/users',
      icon: <IconUsers stroke={1.6} size={22} />,
      name: t('User Management'),
    },
    {
      url: '/admin/user-models',
      icon: <IconUserCog stroke={1.6} size={22} />,
      name: t('User Models'),
    },
    {
      url: '/admin/messages',
      icon: <IconMessages stroke={1.6} size={22} />,
      name: t('User Messages'),
    },
    {
      url: '/',
      icon: <IconMessageCircle stroke={1.6} size={22} />,
      name: 'Chats',
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
    <div className={className}>
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

          {user && (
            <ul className='w-full font-medium text-[14px] absolute bottom-0 right-0 left-0'>
              <li>
                <div className='flex h-16 cursor-pointer items-center justify-between text-gray-900 transition duration-75 group pl-4 pr-4'>
                  <div className='flex items-center'>
                    <Avatar className='w-8 h-8'>
                      <AvatarFallback>
                        {user?.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className='ms-3 capitalize'>{user?.username}</span>
                  </div>
                  <IconLogout
                    onClick={logout}
                    className='text-gray-500'
                    size={18}
                  />
                </div>
              </li>
            </ul>
          )}
        </div>
      </aside>
      <div className='p-4 sm:ml-64'>{children}</div>
    </div>
  );
};

export default  AdminLayout;