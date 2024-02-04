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
  IconPuzzle,
} from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [active, setActive] = useState('');
  const [selectedKeys, setSelectedKeys] = useState();

  // 检测路由变化，更新活跃状态
  useEffect(() => {
    setActive(router.pathname);
  }, [router]);

  const activeClass = (pathName: string) => {
    return pathName === router.pathname ? 'bg-red-100' : '';
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
      <div className='flex h-screen'>
        <div className='bg-white w-64'>
          <Listbox
            variant='light'
            aria-label='User Menu'
            onAction={(key) => setSelectedKeys(key as any)}
            className='p-0 gap-0 divide-y divide-default-300/50 dark:divide-default-100/80 bg-content1 w-full h-full overflow-visible shadow-small'
            itemClasses={{
              base: 'px-6 rounded-none gap-3 h-12',
            }}
            selectionMode='single'
            selectedKeys={selectedKeys}
          >
            <ListboxItem
              className={`${activeClass('/admin/models')}`}
              onClick={() => {
                router.push('/admin/models');
              }}
              key='issues'
              startContent={
                <IconWrapper className='bg-success/10 text-success'>
                  <IconBug className='text-lg ' />
                </IconWrapper>
              }
            >
              Issues
            </ListboxItem>
            <ListboxItem
              className={`${activeClass('/admin/users')}`}
              onClick={() => {
                router.push('/admin/users');
              }}
              key='pull_requests'
              startContent={
                <IconWrapper className='bg-primary/10 text-primary'>
                  <IconPuzzle className='text-lg ' />
                </IconWrapper>
              }
            >
              Pull Requests
            </ListboxItem>
            <ListboxItem
              className={`${activeClass('/admin/messages')}`}
              onClick={() => {
                router.push('/admin/messages');
              }}
              key='discussions'
              startContent={
                <IconWrapper className='bg-secondary/10 text-secondary'>
                  <Icon12Hours className='text-lg ' />
                </IconWrapper>
              }
            >
              Discussions
            </ListboxItem>
            <ListboxItem
              key='actions'
              startContent={
                <IconWrapper className='bg-warning/10 text-warning'>
                  <IconActivityHeartbeat className='text-lg ' />
                </IconWrapper>
              }
            >
              Actions
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
