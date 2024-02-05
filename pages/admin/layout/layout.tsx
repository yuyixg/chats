import {
  NextUIProvider,
  Link,
  Listbox,
  ListboxItem,
  cn,
} from '@nextui-org/react';
import {
  Icon12Hours,
  IconActivityHeartbeat,
  IconBug,
  IconChartLine,
  IconPuzzle,
  IconUser,
} from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [active, setActive] = useState('');

  // 检测路由变化，更新活跃状态
  useEffect(() => {
    setActive(router.pathname);
  }, [router]);

  const activeClass = (pathName: string) => {
    return pathName === router.pathname ? 'bg-gray-100' : '';
  };

  // 创建菜单项组件，用来指示哪个菜单项是活跃的
  const MenuItem = ({ href, children }: any) => (
    <Link
      href={href}
      className={`flex align-middle justify-center mx-4 my-2 h-8  text-black-200 ${
        active === href
          ? 'rounded-small bg-background dark:bg-default'
          : 'font-normal'
      }`}
    >
      {children}
    </Link>
  );

  const IconWrapper = ({ children, className }: any) => (
    <div
      className={cn(
        className,
        'flex items-center rounded-small justify-center w-7 h-7'
      )}
    >
      {children}
    </div>
  );

  const ItemCounter = ({ number }: any) => (
    <div className='flex items-center gap-1 text-default-400'>
      <span className='text-small'>{number}</span>
      {/* <ChevronRightIcon className='text-xl' /> */}
    </div>
  );

  return (
    <NextUIProvider>
      <div className='flex w-full h-16 bg-white shadow-small'>
        <div className='flex w-full items-center justify-between h-16 bg-white px-6'>
          <div className='flex items-center'>
            <img className='h-8 w-8 rounded-lg bg-[#dae6f5]' src='/chats.png' />
            <span className='px-2'>Chats</span>
          </div>
          <div className=''>User</div>
        </div>
      </div>
      <div className='flex h-screen'>
        <div className='w-64 py-6'>
          <Listbox
            variant='light'
            onAction={() => {}}
            className='p-0 gap-0 shadow-small rounded-md divide-y divide-default-300/50 dark:divide-default-100/80 bg-content1 w-full h-full overflow-visible'
            itemClasses={{
              base: 'px-6 rounded-md gap-3 h-12 hover:bg-gray-100 hover:color-black',
            }}
            selectionMode='single'
          >
            <ListboxItem
              className={`${activeClass('/admin/models')}`}
              onClick={() => {
                router.push('/admin/models');
              }}
              key='models'
              startContent={
                <IconWrapper className='bg-success/10 text-success'>
                  <IconUser className='text-lg ' />
                </IconWrapper>
              }
            >
              User Models
            </ListboxItem>
            <ListboxItem
              className={`${activeClass('/admin/users')}`}
              onClick={() => {
                router.push('/admin/users');
              }}
              key='users'
              startContent={
                <IconWrapper className='bg-primary/10 text-primary'>
                  <IconPuzzle className='text-lg ' />
                </IconWrapper>
              }
            >
              Models Config
            </ListboxItem>
            <ListboxItem
              className={`${activeClass('/admin/messages')}`}
              onClick={() => {
                router.push('/admin/messages');
              }}
              key='messages'
              startContent={
                <IconWrapper className='bg-secondary/10 text-secondary'>
                  <Icon12Hours className='text-lg ' />
                </IconWrapper>
              }
            >
              Messages
            </ListboxItem>
            <ListboxItem
              onClick={() => {
                router.push('/');
              }}
              key='Chats'
              startContent={
                <IconWrapper className='bg-warning/10 text-warning'>
                  <IconChartLine className='text-lg ' />
                </IconWrapper>
              }
            >
              Chats
            </ListboxItem>
          </Listbox>
        </div>

        <div className='flex-grow p-6 overflow-y-auto'>{children}</div>
      </div>
    </NextUIProvider>
  );
};
export default AdminLayout;
export const getServerSideProps = async () => {
  console.log('getServerSideProps');
  return {
    props: {},
  };
};
