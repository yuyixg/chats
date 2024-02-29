import { cn } from '@nextui-org/react';
import {
  IconChartPie,
  IconChartPieFilled,
  IconDashboard,
  IconLogin,
  IconMessageChatbot,
  IconMessageCircle2Filled,
  IconMessages,
  IconSettingsCog,
  IconSettingsFilled,
  IconUserFilled,
  IconUserStar,
  IconUsers,
} from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { UserSession, getUserSession } from '@/utils/user';
import { useEffect, useState } from 'react';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { t } = useTranslation('admin');
  const [user, setUser] = useState<UserSession | null>();

  useEffect(() => {
    setUser(getUserSession());
  }, []);

  const activeClass = (pathName: string) => {
    return pathName === router.pathname ? 'bg-gray-100' : '';
  };

  return (
    <>
      <button
        data-drawer-target='logo-sidebar'
        data-drawer-toggle='logo-sidebar'
        aria-controls='logo-sidebar'
        type='button'
        className='inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600'
      >
        <span className='sr-only'>Open sidebar</span>
        <svg
          className='w-6 h-6'
          aria-hidden='true'
          fill='currentColor'
          viewBox='0 0 20 20'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            clip-rule='evenodd'
            fill-rule='evenodd'
            d='M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z'
          ></path>
        </svg>
      </button>

      <aside
        id='logo-sidebar'
        className='fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0'
        aria-label='Sidebar'
      >
        <div className='h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800'>
          <a
            onClick={() => {
              router.push('/admin');
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
          <ul className='space-y-2 font-medium'>
            <li>
              <a
                onClick={() => {
                  router.push('/admin/admin');
                }}
                className='flex items-center p-2 text-gray-600 rounded-lg dark:text-white hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 group'
              >
                <IconChartPie size={26} />
                <span className='ms-3'> {t('Dashboard')}</span>
              </a>
            </li>
            <li>
              <a
                onClick={() => {
                  router.push('/admin/models');
                }}
                className='flex items-center p-2 text-gray-600 rounded-lg dark:text-white hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 group'
              >
                <IconSettingsCog size={26} />
                <span className='flex-1 ms-3 whitespace-nowrap'>
                  {t('Model Configs')}
                </span>
              </a>
            </li>
            <li>
              <a
                onClick={() => {
                  router.push('/admin/users');
                }}
                className='flex items-center p-2 text-gray-600 rounded-lg dark:text-white hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 group'
              >
                <IconUsers size={26} />
                <span className='flex-1 ms-3 whitespace-nowrap'>
                  {t('User Models')}
                </span>
              </a>
            </li>
            <li>
              <a
                onClick={() => {
                  router.push('/admin/messages');
                }}
                className='flex items-center p-2 text-gray-600 rounded-lg dark:text-white hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 group'
              >
                <IconMessages size={26} />
                <span className='flex-1 ms-3 whitespace-nowrap'>
                  {t('User Messages')}
                </span>
              </a>
            </li>
            <li>
              <a
                onClick={() => {
                  router.push('/');
                }}
                className='flex items-center p-2 text-gray-600 rounded-lg dark:text-white hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 group'
              >
                <IconMessageChatbot size={26} />
                <span className='flex-1 ms-3 whitespace-nowrap'>Chats</span>
              </a>
            </li>
          </ul>
          <ul className='pt-4 mt-4 space-y-2 font-medium border-t border-gray-200 dark:border-gray-700'>
            <li>
              <a
                href='#'
                className='flex items-center p-2 text-gray-900 transition duration-75 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white group'
              >
                <IconUserStar size={26} />
                <span className='ms-3'>{user?.username?.toUpperCase()}</span>
              </a>
            </li>
          </ul>
        </div>
      </aside>
      <div className='p-4 sm:ml-64'>
        {/* <div className='p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700'>
          <div className='grid grid-cols-3 gap-4 mb-4'>
            <div className='flex items-center justify-center h-24 rounded bg-gray-50 dark:bg-gray-800'>
              <p className='text-2xl text-gray-400 dark:text-gray-500'>
                <svg
                  className='w-3.5 h-3.5'
                  aria-hidden='true'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 18 18'
                >
                  <path
                    stroke='currentColor'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    stroke-width='2'
                    d='M9 1v16M1 9h16'
                  />
                </svg>
              </p>
            </div>
            <div className='flex items-center justify-center h-24 rounded bg-gray-50 dark:bg-gray-800'>
              <p className='text-2xl text-gray-400 dark:text-gray-500'>
                <svg
                  className='w-3.5 h-3.5'
                  aria-hidden='true'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 18 18'
                >
                  <path
                    stroke='currentColor'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    stroke-width='2'
                    d='M9 1v16M1 9h16'
                  />
                </svg>
              </p>
            </div>
            <div className='flex items-center justify-center h-24 rounded bg-gray-50 dark:bg-gray-800'>
              <p className='text-2xl text-gray-400 dark:text-gray-500'>
                <svg
                  className='w-3.5 h-3.5'
                  aria-hidden='true'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 18 18'
                >
                  <path
                    stroke='currentColor'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    stroke-width='2'
                    d='M9 1v16M1 9h16'
                  />
                </svg>
              </p>
            </div>
          </div>
          <div className='flex items-center justify-center h-48 mb-4 rounded bg-gray-50 dark:bg-gray-800'>
            <p className='text-2xl text-gray-400 dark:text-gray-500'>
              <svg
                className='w-3.5 h-3.5'
                aria-hidden='true'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 18 18'
              >
                <path
                  stroke='currentColor'
                  stroke-linecap='round'
                  stroke-linejoin='round'
                  stroke-width='2'
                  d='M9 1v16M1 9h16'
                />
              </svg>
            </p>
          </div>
          <div className='grid grid-cols-2 gap-4 mb-4'>
            <div className='flex items-center justify-center rounded bg-gray-50 h-28 dark:bg-gray-800'>
              <p className='text-2xl text-gray-400 dark:text-gray-500'>
                <svg
                  className='w-3.5 h-3.5'
                  aria-hidden='true'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 18 18'
                >
                  <path
                    stroke='currentColor'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    stroke-width='2'
                    d='M9 1v16M1 9h16'
                  />
                </svg>
              </p>
            </div>
            <div className='flex items-center justify-center rounded bg-gray-50 h-28 dark:bg-gray-800'>
              <p className='text-2xl text-gray-400 dark:text-gray-500'>
                <svg
                  className='w-3.5 h-3.5'
                  aria-hidden='true'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 18 18'
                >
                  <path
                    stroke='currentColor'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    stroke-width='2'
                    d='M9 1v16M1 9h16'
                  />
                </svg>
              </p>
            </div>
            <div className='flex items-center justify-center rounded bg-gray-50 h-28 dark:bg-gray-800'>
              <p className='text-2xl text-gray-400 dark:text-gray-500'>
                <svg
                  className='w-3.5 h-3.5'
                  aria-hidden='true'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 18 18'
                >
                  <path
                    stroke='currentColor'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    stroke-width='2'
                    d='M9 1v16M1 9h16'
                  />
                </svg>
              </p>
            </div>
            <div className='flex items-center justify-center rounded bg-gray-50 h-28 dark:bg-gray-800'>
              <p className='text-2xl text-gray-400 dark:text-gray-500'>
                <svg
                  className='w-3.5 h-3.5'
                  aria-hidden='true'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 18 18'
                >
                  <path
                    stroke='currentColor'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    stroke-width='2'
                    d='M9 1v16M1 9h16'
                  />
                </svg>
              </p>
            </div>
          </div>
          <div className='flex items-center justify-center h-48 mb-4 rounded bg-gray-50 dark:bg-gray-800'>
            <p className='text-2xl text-gray-400 dark:text-gray-500'>
              <svg
                className='w-3.5 h-3.5'
                aria-hidden='true'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 18 18'
              >
                <path
                  stroke='currentColor'
                  stroke-linecap='round'
                  stroke-linejoin='round'
                  stroke-width='2'
                  d='M9 1v16M1 9h16'
                />
              </svg>
            </p>
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='flex items-center justify-center rounded bg-gray-50 h-28 dark:bg-gray-800'>
              <p className='text-2xl text-gray-400 dark:text-gray-500'>
                <svg
                  className='w-3.5 h-3.5'
                  aria-hidden='true'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 18 18'
                >
                  <path
                    stroke='currentColor'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    stroke-width='2'
                    d='M9 1v16M1 9h16'
                  />
                </svg>
              </p>
            </div>
            <div className='flex items-center justify-center rounded bg-gray-50 h-28 dark:bg-gray-800'>
              <p className='text-2xl text-gray-400 dark:text-gray-500'>
                <svg
                  className='w-3.5 h-3.5'
                  aria-hidden='true'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 18 18'
                >
                  <path
                    stroke='currentColor'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    stroke-width='2'
                    d='M9 1v16M1 9h16'
                  />
                </svg>
              </p>
            </div>
            <div className='flex items-center justify-center rounded bg-gray-50 h-28 dark:bg-gray-800'>
              <p className='text-2xl text-gray-400 dark:text-gray-500'>
                <svg
                  className='w-3.5 h-3.5'
                  aria-hidden='true'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 18 18'
                >
                  <path
                    stroke='currentColor'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    stroke-width='2'
                    d='M9 1v16M1 9h16'
                  />
                </svg>
              </p>
            </div>
            <div className='flex items-center justify-center rounded bg-gray-50 h-28 dark:bg-gray-800'>
              <p className='text-2xl text-gray-400 dark:text-gray-500'>
                <svg
                  className='w-3.5 h-3.5'
                  aria-hidden='true'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 18 18'
                >
                  <path
                    stroke='currentColor'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    stroke-width='2'
                    d='M9 1v16M1 9h16'
                  />
                </svg>
              </p>
            </div>
          </div>
        </div> */}
        {children}
      </div>

      {/* <div className='flex h-screen'>
        <div className='flex-none w-64 basis-64 shadow-small overflow-hidden'>
          <div className='flex w-full bg-white'>
            <div className='flex w-full items-center justify-between h-16 bg-white px-6'>
              <div className='flex items-center'>
                <img
                  className='h-8 w-8 rounded-lg bg-[#dae6f5]'
                  src='/chats.png'
                />
                <span className='px-2'>Chats</span>
              </div>
            </div>
          </div>
          <Listbox
            variant='light'
            onAction={() => {}}
            className='p-0 gap-0 rounded-md divide-y divide-default-300/50 dark:divide-default-100/80 bg-content1 w-full overflow-visible'
            itemClasses={{
              base: 'px-6 rounded-md gap-3 h-12 hover:bg-gray-100 hover:color-black',
            }}
            selectionMode='single'
          >
            <ListboxItem
              className={`${activeClass('/admin')}`}
              onClick={() => {
                router.push('/admin');
              }}
              key='admin'
              startContent={
                <IconWrapper className='bg-success/10 text-success'>
                  <IconDashboard size={26} />
                </IconWrapper>
              }
            >
              {t('Dashboard')}
            </ListboxItem>
            <ListboxItem
              className={`${activeClass('/admin/models')}`}
              onClick={() => {
                router.push('/admin/models');
              }}
              key='users'
              startContent={
                <IconWrapper className='bg-primary/10 text-primary'>
                  <IconSettingsCog className='text-lg ' />
                </IconWrapper>
              }
            >
              {t('Model Configs')}
            </ListboxItem>
            <ListboxItem
              className={`${activeClass('/admin/users')}`}
              onClick={() => {
                router.push('/admin/users');
              }}
              key='models'
              startContent={
                <IconWrapper className='bg-danger/10 text-danger'>
                  <IconUsers className='text-lg ' />
                </IconWrapper>
              }
            >
              {t('User Models')}
            </ListboxItem>
            <ListboxItem
              className={`${activeClass('/admin/messages')}`}
              onClick={() => {
                router.push('/admin/messages');
              }}
              key='messages'
              startContent={
                <IconWrapper className='bg-secondary/10 text-secondary'>
                  <IconMessages className='text-lg ' />
                </IconWrapper>
              }
            >
              {t('User Messages')}
            </ListboxItem>
            <ListboxItem
              onClick={() => {
                router.push('/');
              }}
              key='Chats'
              startContent={
                <IconWrapper className='bg-warning/10 text-warning'>
                  <IconMessageChatbot className='text-lg ' />
                </IconWrapper>
              }
            >
              Chats
            </ListboxItem>
          </Listbox>
          <div className='flex items-center p-6 absolute bottom-0'>
            <div className='bg-gray-200 rounded-md p-1'>
              <IconUserStar />
            </div>
            <div className='px-4'>{user?.username}</div>
          </div>
        </div>

        <div className='flex-grow p-6 py-4 overflow-auto'>{children}</div>
      </div> */}
    </>
  );
};
export default AdminLayout;
export const getServerSideProps = async (req: any) => {
  return {
    props: {},
  };
};
