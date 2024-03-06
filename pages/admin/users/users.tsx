import React, { useEffect, useState } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  Input,
  Button,
  Spinner,
} from '@nextui-org/react';
import { getUsers } from '@/apis/adminService';
import { GetUsersResult } from '@/types/admin';
import { IconPencil, IconPlus, IconSearch } from '@tabler/icons-react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useThrottle } from '@/hooks/useThrottle';
import { UserModal } from '@/components/Admin/userModal';

export default function Users() {
  const { t } = useTranslation('admin');
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<GetUsersResult | null>(null);
  const [users, setUsers] = useState<GetUsersResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState<string>('');
  const throttledValue = useThrottle(query, 1000);

  useEffect(() => {
    init();
  }, [throttledValue]);

  const init = () => {
    getUsers(query).then((data) => {
      setUsers(data);
      setIsOpenModal(false);
      setSelectedUser(null);
      setLoading(false);
    });
  };

  const handleShowAddModal = () => {
    setIsOpenModal(true);
  };

  const handleShowEditModal = (user: GetUsersResult) => {
    console.log('user', user);
    setSelectedUser(user);
    setIsOpenModal(true);
  };

  const handleClose = () => {
    setIsOpenModal(false);
    setSelectedUser(null);
  };

  const columns = [
    { name: t('User Name'), uid: 'username' },
    { name: t('Role'), uid: 'role' },
    { name: t('Actions'), uid: 'actions' },
  ];

  const renderCell = React.useCallback(
    (item: GetUsersResult, columnKey: React.Key) => {
      switch (columnKey) {
        case 'username':
          return <div>{item.username}</div>;
        case 'role':
          return <div>{item.role}</div>;
        case 'actions':
          return (
            <div className='relative flex items-center'>
              <Tooltip content={t('Edit')}>
                <span className='text-lg text-default-400 cursor-pointer active:opacity-50'>
                  <IconPencil
                    onClick={() => {
                      handleShowEditModal(item);
                    }}
                    className='text-default-400'
                    size={20}
                  />
                </span>
              </Tooltip>
            </div>
          );
        default:
          return <div></div>;
      }
    },
    []
  );

  return (
    <>
      <div className='flex flex-col gap-4 mb-4'>
        <div className='flex justify-between gap-3 items-center'>
          <Input
            size='sm'
            isClearable
            classNames={{
              base: 'w-full',
            }}
            placeholder={t('Search by name...')!}
            startContent={<IconSearch className='text-default-300' />}
            value={query}
            onClear={() => setQuery('')}
            onValueChange={(value: string) => {
              setQuery(value);
            }}
          />
          <Button
            onClick={() => handleShowAddModal()}
            color='primary'
            size='lg'
            endContent={<IconPlus size={32} />}
          >
            {t('Add User')}
          </Button>
        </div>
      </div>
      <Table
        classNames={{
          table: loading ? 'min-h-[320px]' : 'auto',
        }}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.uid}>{column.name}</TableColumn>
          )}
        </TableHeader>
        <TableBody
          loadingContent={<Spinner label={t('Loading...')!} />}
          isLoading={loading}
          items={users}
        >
          {(item) => (
            <TableRow key={item.id} className='hover:bg-gray-100'>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <UserModal
        user={selectedUser}
        onSuccessful={init}
        onClose={handleClose}
        isOpen={isOpenModal}
      ></UserModal>
    </>
  );
}

export const getServerSideProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common', 'admin'])),
    },
  };
};
