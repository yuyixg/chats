import React, { useEffect, useState } from 'react';

import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { useThrottle } from '@/hooks/useThrottle';

import { GetUserModelResult } from '@/types/admin';
import { DEFAULT_LANGUAGE } from '@/utils/settings';

import { AddUserModelModal } from '@/components/Admin/UserModels/AddUserModelModal';
import { EditUserModelModal } from '@/components/Admin/UserModels/EditUserModelModal';
import { EditUserBalanceModal } from '@/components/Admin/Users/EditUserBalanceModel';
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

import { getUserModels } from '@/apis/adminService';

export default function UserModels() {
  const { t } = useTranslation('admin');
  const [isOpen, setIsOpen] = useState({
    add: false,
    edit: false,
    recharge: false,
  });
  const [selectedUserModel, setSelectedUserModel] =
    useState<GetUserModelResult | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string>();
  const [userModels, setUserModels] = useState<GetUserModelResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState<string>('');
  const throttledValue = useThrottle(query, 1000);

  const init = () => {
    getUserModels(query).then((data) => {
      setUserModels(data);
      setIsOpen({ add: false, edit: false, recharge: false });
      setSelectedUserModel(null);
      setLoading(false);
    });
  };

  useEffect(() => {
    init();
  }, [throttledValue]);

  const handleShowAddModal = (item: GetUserModelResult | null) => {
    setSelectedUserModel(item);
    setIsOpen({ add: true, edit: false, recharge: false });
  };

  const handleEditModal = (item: GetUserModelResult, modelId: string) => {
    setSelectedModelId(modelId);
    setSelectedUserModel(item);
    setIsOpen({ add: false, edit: true, recharge: false });
  };

  const handleClose = () => {
    setIsOpen({ add: false, edit: false, recharge: false });
    setSelectedUserModel(null);
  };

  const handleShowRechargeModal = (item: GetUserModelResult | null) => {
    setSelectedUserModel(item);
    setIsOpen({ add: false, edit: false, recharge: true });
  };

  const UserNameCell = (user: GetUserModelResult, rowSpan: number = 1) => {
    return (
      <TableCell rowSpan={rowSpan}>
        <div className="flex items-center gap-2">
          <div>{user.userName}</div>
        </div>
      </TableCell>
    );
  };

  const UserBalanceCell = (user: GetUserModelResult, rowSpan: number = 1) => {
    return (
      <TableCell
        rowSpan={rowSpan}
        className="cursor-pointer hover:underline"
        onClick={() => handleShowRechargeModal(user)}
      >
        <div className="flex items-center gap-2">
          <div>{(+user.balance).toFixed(2)}</div>
        </div>
      </TableCell>
    );
  };

  const ModelCell = (
    user: GetUserModelResult,
    modelId: string,
    value: any,
    hover: boolean = false,
  ) => {
    return (
      <TableCell
        className={`cursor-pointer ${hover && 'hover:underline'}`}
        onClick={() => handleEditModal(user, modelId)}
      >
        {value}
      </TableCell>
    );
  };

  const EditModelCell = (user: GetUserModelResult, modelId: string) => {
    return (
      <TableCell
        className="text-primary hover:underline underline-offset-4 cursor-pointer"
        onClick={() => handleEditModal(user, modelId)}
      >
        {t('Edit')}
      </TableCell>
    );
  };

  const ActionCell = (user: GetUserModelResult, rowSpan: number = 1) => {
    return (
      <TableCell rowSpan={rowSpan}>
        <Button variant="link" onClick={() => handleShowAddModal(user)}>
          {t('Add Model')}
        </Button>
      </TableCell>
    );
  };

  return (
    <>
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex justify-between gap-3 items-center">
          <Input
            placeholder={t('Search...')!}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
          />
          <Button
            onClick={() => {
              handleShowAddModal(null);
            }}
            color="primary"
          >
            {t('Batch add Model')}
          </Button>
        </div>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow className="pointer-events-none">
              <TableHead rowSpan={2}>{t('User Name')}</TableHead>
              <TableHead
                rowSpan={2}
                style={{ borderRight: '1px solid hsl(var(--muted))' }}
              >
                {t('Balance')}
              </TableHead>
              <TableHead colSpan={5} className="text-center">
                {t('Models')}
              </TableHead>
              <TableHead
                rowSpan={2}
                style={{ borderLeft: '1px solid hsl(var(--muted))' }}
                className="w-16 text-center"
              >
                {t('Actions')}
              </TableHead>
            </TableRow>
            <TableRow className="pointer-events-none">
              <TableHead>{t('Model Display Name')}</TableHead>
              <TableHead>{t('Remaining Tokens')}</TableHead>
              <TableHead>{t('Remaining Counts')}</TableHead>
              <TableHead>{t('Expiration Time')}</TableHead>
              <TableHead>{t('Actions')}</TableHead>
            </TableRow>
          </TableHeader>

          {userModels.map((user) => (
            <TableBody
              emptyText={t('No data')!}
              key={user.userId}
              className="tbody-hover"
              style={{ borderTop: '1px solid hsl(var(--muted))' }}
            >
              {user.models.length > 0 ? (
                user.models.map((model, index) => {
                  return (
                    <TableRow
                      key={model.modelId}
                      className={`${
                        index !== user.models.length - 1 && 'border-none'
                      }`}
                    >
                      {index === 0 && UserNameCell(user, user.models.length)}
                      {index === 0 && UserBalanceCell(user, user.models.length)}
                      {ModelCell(user, model.modelId, model.modelName, true)}
                      {ModelCell(user, model.modelId, model.tokens)}
                      {ModelCell(user, model.modelId, model.counts)}
                      {ModelCell(user, model.modelId, model.expires)}
                      {EditModelCell(user, model.modelId)}
                      {index === 0 && ActionCell(user, user.models.length)}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow
                  key={user.userId}
                  className="cursor-pointer"
                  onClick={() => handleShowAddModal(user)}
                >
                  {UserNameCell(user)}
                  {UserBalanceCell(user)}
                  <TableCell className="text-center text-gray-500" colSpan={5}>
                    {t('Click set model')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          ))}
        </Table>
      </Card>
      <AddUserModelModal
        userModelIds={userModels.map((x: GetUserModelResult) => x.userModelId)}
        selectedModel={selectedUserModel}
        onSuccessful={init}
        onClose={handleClose}
        isOpen={isOpen.add}
      />
      <EditUserModelModal
        selectedModelId={selectedModelId!}
        selectedUserModel={selectedUserModel}
        onSuccessful={init}
        onClose={handleClose}
        isOpen={isOpen.edit}
      />
      <EditUserBalanceModal
        onSuccessful={init}
        onClose={handleClose}
        userId={selectedUserModel?.userId}
        userBalance={selectedUserModel?.balance}
        isOpen={isOpen.recharge}
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
