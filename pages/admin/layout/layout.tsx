import { NextUIProvider, Listbox, ListboxItem, cn } from '@nextui-org/react';
import {
  IconDashboard,
  IconMessageChatbot,
  IconMessages,
  IconSettingsCog,
  IconUser,
} from '@tabler/icons-react';
import { useRouter } from 'next/router';
const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  const activeClass = (pathName: string) => {
    return pathName === router.pathname ? 'bg-gray-100' : '';
  };

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
        <div className='flex-none py-6 w-64 basis-64'>
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
              className={`${activeClass('/admin')}`}
              onClick={() => {
                router.push('/admin');
              }}
              key='admin'
              startContent={
                <IconWrapper className='bg-success/10 text-success'>
                  <IconDashboard className='text-lg ' />
                </IconWrapper>
              }
            >
              Dashboard
            </ListboxItem>
            <ListboxItem
              className={`${activeClass('/admin/users')}`}
              onClick={() => {
                router.push('/admin/users');
              }}
              key='models'
              startContent={
                <IconWrapper className='bg-danger/10 text-danger'>
                  <IconUser className='text-lg ' />
                </IconWrapper>
              }
            >
              User Models
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
                  <IconMessages className='text-lg ' />
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
                  <IconMessageChatbot className='text-lg ' />
                </IconWrapper>
              }
            >
              Chats
            </ListboxItem>
          </Listbox>
        </div>

        <div className='flex-grow p-6 overflow-auto'>{children}</div>
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
