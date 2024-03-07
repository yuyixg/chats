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
import { UserSession, getUserSession } from '@/utils/user';
import { useEffect, useState } from 'react';
import { Avatar } from '@nextui-org/react';

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
      ? 'bg-gray-100 shadow-sm text-[#338df3]'
      : 'text-gray-600';
  };

  const menus = [
    {
      url: '/admin/dashboard',
      icon: <IconChartPie size={22} />,
      name: t('Dashboard'),
    },
    {
      url: '/admin/models',
      icon: <IconSettingsCog size={22} />,
      name: t('Model Configs'),
    },
    {
      url: '/admin/users',
      icon: <IconUsers size={22} />,
      name: t('User Management'),
    },
    {
      url: '/admin/user-models',
      icon: <IconUserCog size={22} />,
      name: t('User Models'),
    },
    {
      url: '/admin/messages',
      icon: <IconMessages size={22} />,
      name: t('User Messages'),
    },
    {
      url: '/',
      icon: <IconMessageCircle size={22} />,
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
          className={`flex items-center p-2 cursor-pointer rounded-lg dark:hover:bg-gray-700  hover:bg-gray-100 hover:text-[#338df3] group ${activeClass(
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
      <button
        data-drawer-target='logo-sidebar'
        data-drawer-toggle='logo-sidebar'
        aria-controls='logo-sidebar'
        type='button'
        className='inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600'
      >
        <span className='sr-only'>Open sidebar</span>
      </button>

      <aside className='fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0 shadow-medium'>
        <div className='h-full px-3 py-4 overflow-y-auto bg-white dark:bg-gray-800'>
          <a
            onClick={() => {
              router.push('/admin/dashboard');
            }}
            className='flex items-center ps-2.5 mb-5'
          >
            <img
              className='h-8 me-3 bg-[#dae6f5] rounded-lg'
              alt='chats Logo'
              src='/chats.png'
            />
            <span className='self-center text-xl font-semibold whitespace-nowrap dark:text-white'>
              Chats
            </span>
          </a>
          <ul className='space-y-2 font-medium text-[15px]'>
            {menus.map((m) => {
              return MenuItem(m);
            })}
          </ul>
          {user && (
            <ul className='px-2 w-full font-medium absolute bottom-4'>
              <li>
                <div className='flex cursor-pointer items-center text-gray-900 transition duration-75 rounded-lg dark:text-white group'>
                  <Avatar
                    className='w-8 h-8'
                    icon={
                      <div className=' bg-gray-200 w-full h-full flex justify-center items-center font-semibold text-sm'>
                        {user?.username[0].toUpperCase()}
                      </div>
                    }
                  />
                  <span className='ms-3 capitalize'>{user?.username}</span>
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
export default AdminLayout;
export const getServerSideProps = async () => {
  return {
    props: {},
  };
};
