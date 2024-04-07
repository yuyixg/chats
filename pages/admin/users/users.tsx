import React, { useEffect, useState } from 'react';
import { getUsers } from '@/apis/adminService';
import { GetUsersResult } from '@/types/admin';
import { IconDots, IconPlus } from '@tabler/icons-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EditUserBalanceModal } from '@/components/Admin/Users/EditUserBalanceModel';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';

export default function Users() {
  const { t } = useTranslation('admin');
  const [isOpenModal, setIsOpenModal] = useState({
    edit: false,
    create: false,
    recharge: false,
  });
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
      handleClose();
      setLoading(false);
    });
  };

  const handleShowAddModal = () => {
    setIsOpenModal({ edit: false, create: true, recharge: false });
  };

  const handleShowEditModal = (user: GetUsersResult) => {
    setSelectedUser(user);
    setIsOpenModal({ edit: true, create: false, recharge: false });
  };

  const handleShowReChargeModal = (user: GetUsersResult) => {
    setSelectedUser(user);
    setIsOpenModal({ edit: false, create: false, recharge: true });
  };

  const handleClose = () => {
    setIsOpenModal({ edit: false, create: false, recharge: false });
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
              <TableHead>
                {t('Balance')}({t('Unit')})
              </TableHead>
              <TableHead>{t('Phone')}</TableHead>
              <TableHead>{t('E-mail')}</TableHead>
              <TableHead>{t('Created Time')}</TableHead>
              <TableHead className='w-16'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody isLoading={loading}>
            {users.map((item) => (
              <TableRow className='cursor-pointer' key={item.id}>
                <TableCell>
                  <div className='flex gap-1 items-center'>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        item.enabled ? 'bg-green-400' : 'bg-gray-400'
                      }`}
                    ></div>
                    {item.username}
                    {item.provider && (
                      <Badge className='capitalize'>{item.provider}</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{item.role}</TableCell>
                <TableCell>{(+item.balance).toFixed(2)}</TableCell>
                <TableCell>{item.phone}</TableCell>
                <TableCell>{item.email}</TableCell>
                <TableCell>
                  {new Date(item.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant='ghost'>
                        <IconDots size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => {
                          handleShowEditModal(item);
                        }}
                      >
                        {t('Edit')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          handleShowReChargeModal(item);
                        }}
                      >
                        {t('User recharge')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
        isOpen={isOpenModal.create || isOpenModal.edit}
      />
      <EditUserBalanceModal
        onSuccessful={init}
        onClose={handleClose}
        user={selectedUser}
        isOpen={isOpenModal.recharge}
      />
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
