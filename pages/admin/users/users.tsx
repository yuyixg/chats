import React, { useEffect, useState } from 'react';
import { getUsers } from '@/apis/adminService';
import { GetUsersResult } from '@/types/admin';
import { IconPlus } from '@tabler/icons-react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useThrottle } from '@/hooks/useThrottle';
import { UserModal } from '@/components/Admin/Users/UserModal';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DEFAULT_LANGUAGE } from '@/types/settings';

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
    setSelectedUser(user);
    setIsOpenModal(true);
  };

  const handleClose = () => {
    setIsOpenModal(false);
    setSelectedUser(null);
  };

  return (
    <>
      <div className='flex flex-col gap-4 mb-4'>
        <div className='flex justify-between gap-3 items-center'>
          <Input
            className='w-full'
            placeholder={t('Search...')!}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
          />
          <Button onClick={() => handleShowAddModal()} color='primary'>
            <IconPlus size={20} />
            {t('Add User')}
          </Button>
        </div>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('User Name')}</TableHead>
              <TableHead>{t('Role')}</TableHead>
              <TableHead>{t('Balance')}</TableHead>
              <TableHead>{t('Created Time')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody isLoading={loading}>
            {users.map((item) => (
              <TableRow
                className='cursor-pointer'
                key={item.id}
                onClick={() => {
                  handleShowEditModal(item);
                }}
              >
                <TableCell>{item.username}</TableCell>
                <TableCell>{item.role}</TableCell>
                <TableCell>{(+item.balance).toFixed(2)}</TableCell>
                <TableCell>
                  {new Date(item.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
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
      ...(await serverSideTranslations(locale ?? DEFAULT_LANGUAGE, [
        'common',
        'admin',
      ])),
    },
  };
};
