import React, { useEffect, useState } from 'react';

import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { useThrottle } from '@/hooks/useThrottle';

import { DEFAULT_LANGUAGE } from '@/utils/settings';

import { GetModelResult, GetUsersResult } from '@/types/admin';
import { PageResult, Paging } from '@/types/page';

import PaginationContainer from '@/components/Admin/Pagiation/Pagiation';
import { EditUserBalanceModal } from '@/components/Admin/Users/EditUserBalanceModel';
import { EditUserModelModal } from '@/components/Admin/Users/EditUserModelModal';
import { UserModal } from '@/components/Admin/Users/UserModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { getModels, getUsers } from '@/apis/adminApis';

export default function Users() {
  const { t } = useTranslation('admin');
  const [models, setModels] = useState<GetModelResult[]>([]);
  const [isOpenModal, setIsOpenModal] = useState({
    edit: false,
    create: false,
    recharge: false,
    changeModel: false,
  });
  const [pagination, setPagination] = useState<Paging>({
    page: 1,
    pageSize: 50,
  });
  const [selectedUser, setSelectedUser] = useState<GetUsersResult | null>(null);
  const [users, setUsers] = useState<PageResult<GetUsersResult[]>>({
    count: 0,
    rows: [],
  });

  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState<string>('');
  const throttledValue = useThrottle(query, 1000);

  useEffect(() => {
    getModels().then((data) => {
      setModels(data.filter((x) => x.enabled === true));
    });
  }, []);

  useEffect(() => {
    init();
  }, [pagination, throttledValue]);

  const init = () => {
    getUsers({ query, ...pagination }).then((data) => {
      setUsers(data);
      handleClose();
      setLoading(false);
    });
  };

  const handleShowAddModal = () => {
    setIsOpenModal({
      edit: false,
      create: true,
      recharge: false,
      changeModel: false,
    });
  };

  const handleShowEditModal = (user: GetUsersResult) => {
    setSelectedUser(user);
    setIsOpenModal({
      edit: true,
      create: false,
      recharge: false,
      changeModel: false,
    });
  };

  const handleShowReChargeModal = (user: GetUsersResult) => {
    setSelectedUser(user);
    setIsOpenModal({
      edit: false,
      create: false,
      recharge: true,
      changeModel: false,
    });
  };

  const handleShowChangeModal = (user: GetUsersResult) => {
    setSelectedUser(user);
    setIsOpenModal({
      edit: false,
      create: false,
      recharge: false,
      changeModel: true,
    });
  };

  const handleClose = () => {
    setIsOpenModal({
      edit: false,
      create: false,
      recharge: false,
      changeModel: false,
    });
    setSelectedUser(null);
  };

  return (
    <>
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex justify-between gap-3 items-center">
          <Input
            className="w-full"
            placeholder={t('Search...')!}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
          />
          <Button onClick={() => handleShowAddModal()} color="primary">
            {t('Add User')}
          </Button>
        </div>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('User Name')}</TableHead>
              <TableHead>{t('Account')}</TableHead>
              <TableHead>{t('Role')}</TableHead>
              <TableHead>{t('Phone')}</TableHead>
              <TableHead>{t('E-Mail')}</TableHead>
              <TableHead>
                {t('Balance')}({t('Yuan')})
              </TableHead>
              <TableHead>{t('Model Count')}</TableHead>
              <TableHead>{t('Created Time')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody isLoading={loading} isEmpty={users.rows.length === 0}>
            {users.rows.map((item) => (
              <TableRow
                className="cursor-pointer"
                key={item.id}
                onClick={() => {
                  handleShowEditModal(item);
                }}
              >
                <TableCell>
                  <div className="flex gap-1 items-center">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        item.enabled ? 'bg-green-400' : 'bg-gray-400'
                      }`}
                    ></div>
                    {item.username}
                    {item.provider && (
                      <Badge className="capitalize">{item.provider}</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{item.account}</TableCell>
                <TableCell>{item.role}</TableCell>
                <TableCell>{item.phone}</TableCell>
                <TableCell>{item.email}</TableCell>
                <TableCell
                  className="hover:underline"
                  onClick={(e) => {
                    handleShowReChargeModal(item);
                    e.stopPropagation();
                  }}
                >
                  {(+item.balance).toFixed(2)}
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="link"
                    onClick={(e) => {
                      handleShowChangeModal(item);
                      e.stopPropagation();
                    }}
                  >
                    {item.models.filter((x) => x.enabled).length}
                  </Button>
                </TableCell>
                <TableCell>
                  {new Date(item.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {users.count !== 0 && (
          <PaginationContainer
            page={pagination.page}
            pageSize={pagination.pageSize}
            currentCount={users.rows.length}
            totalCount={users.count}
            onPagingChange={(page, pageSize) => {
              setPagination({ page, pageSize });
            }}
          />
        )}
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
        userId={selectedUser?.id}
        userBalance={selectedUser?.balance}
        isOpen={isOpenModal.recharge}
      />
      <EditUserModelModal
        onSuccessful={init}
        onClose={handleClose}
        isOpen={isOpenModal.changeModel}
        models={models}
        userModelId={selectedUser?.userModelId || ''}
        select={selectedUser?.models || []}
      />
    </>
  );
}

export const getServerSideProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? DEFAULT_LANGUAGE, ['admin'])),
    },
  };
};
