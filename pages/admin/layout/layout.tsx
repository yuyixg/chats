import {
  NextUIProvider,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from '@nextui-org/react';
import { useRouter } from 'next/router';
import { useEffect, useLayoutEffect, useState } from 'react';
const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [active, setActive] = useState('');

  // 检测路由变化，更新活跃状态
  useEffect(() => {
    setActive(router.pathname);
  }, [router]);

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

  return (
    <NextUIProvider>
      <div className='flex h-screen'>
        <div className='bg-gray-100 w-64 p-6 space-y-6'>
          <div className='flex items-center space-x-2'>
            {/* <img src='/logo.png' alt='Logo' className='h-8 w-8' /> */}
          </div>
          <nav className='flex flex-col h-auto rounded-medium'>
            <MenuItem href='/admin/models'>Models</MenuItem>
            <MenuItem href='/admin/users'>Users</MenuItem>
            <MenuItem href='/admin/messages'>Messages</MenuItem>
          </nav>
          {/* <div className='mt-auto'>
            <Button color='danger' onClick={() => alert('Logout')}>
              Logout
            </Button>
          </div> */}
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
