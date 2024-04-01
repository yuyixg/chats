import React, { useEffect, useState } from 'react';
import { getUserModels } from '@/apis/adminService';
import { GetUserModelResult } from '@/types/admin';
import { IconPlus } from '@tabler/icons-react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useThrottle } from '@/hooks/useThrottle';
import { AddUserModelModal } from '@/components/Admin/UserModels/AddUserModelModal';
import { EditUserModelModal } from '@/components/Admin/UserModels/EditUserModelModal';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DEFAULT_LANGUAGE } from '@/types/settings';

export default function UserModels() {
  const { t } = useTranslation('admin');
  const [isOpen, setIsOpen] = useState({ add: false, edit: false });
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
      setIsOpen({ add: false, edit: false });
      setSelectedUserModel(null);
      setLoading(false);
    });
  };

  useEffect(() => {
    init();
  }, [throttledValue]);

  const handleShowAddModal = (item: GetUserModelResult | null) => {
    setSelectedUserModel(item);
    setIsOpen({ add: true, edit: false });
  };

  const handleEditModal = (item: GetUserModelResult, modelId: string) => {
    setSelectedModelId(modelId);
    setSelectedUserModel(item);
    setIsOpen({ add: false, edit: true });
  };

  const handleClose = () => {
    setIsOpen({ add: false, edit: false });
    setSelectedUserModel(null);
  };

  const UserTableCell = (user: GetUserModelResult, rowSpan: number = 1) => {
    return (
      <TableCell
        rowSpan={rowSpan}
        className='cursor-pointer py-2 capitalize'
        onClick={() => handleShowAddModal(user)}
      >
        <div className='flex items-center gap-2 h-6'>
          <Avatar className='h-8 w-8 rounded-[50%]'>
            <AvatarFallback>{user.userName[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className='font-semibold hover:underline'>{user.userName}</p>
            <p className='text-[12px] text-gray-500'>{user.role}</p>
          </div>
        </div>
      </TableCell>
    );
  };

  const ModelTableCell = (
    user: GetUserModelResult,
    modelId: string,
    value: any,
    hover: boolean = false
  ) => {
    return (
      <TableCell
        className={`cursor-pointer py-2 ${hover && 'hover:underline'}`}
        onClick={() => handleEditModal(user, modelId)}
      >
        {value || '-'}
      </TableCell>
    );
  };

  return (
    <>
      <div className='flex flex-col gap-4 mb-4'>
        <div className='flex justify-between gap-3 items-center'>
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
            color='primary'
          >
            <IconPlus size={20} />
            {t('Batch add Model')}
          </Button>
        </div>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow className='pointer-events-none'>
              <TableHead
                rowSpan={2}
                style={{ borderRight: '1px solid hsl(var(--muted))' }}
              >
                {t('User Name')}
              </TableHead>
              <TableHead colSpan={4} className='text-center h-8'>
                {t('Models')}
              </TableHead>
            </TableRow>
            <TableRow className='pointer-events-none'>
              <TableHead className='h-8'>{t('Model Display Name')}</TableHead>
              <TableHead className='h-8'>{t('Remaining Tokens')}</TableHead>
              <TableHead className='h-8'>{t('Remaining Counts')}</TableHead>
              <TableHead className='h-8'>{t('Expiration Time')}</TableHead>
            </TableRow>
          </TableHeader>

          {userModels.map((user) => (
            <TableBody
              key={user.userId}
              className='tbody-hover'
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
                      {index === 0 && UserTableCell(user, user.models.length)}
                      {ModelTableCell(
                        user,
                        model.modelId,
                        model.modelName,
                        true
                      )}
                      {ModelTableCell(user, model.modelId, model.tokens)}
                      {ModelTableCell(user, model.modelId, model.counts)}
                      {ModelTableCell(user, model.modelId, model.expires)}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow
                  key={user.userId}
                  className='cursor-pointer'
                  onClick={() => handleShowAddModal(user)}
                >
                  {UserTableCell(user)}
                  <TableCell
                    className='py-2 text-center text-gray-500'
                    colSpan={4}
                  >
                    {t('Click User name set model')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          ))}
        </Table>
      </Card>
      <AddUserModelModal
        userModelIds={userModels.map((x) => x.userModelId)}
        selectedModel={selectedUserModel}
        onSuccessful={init}
        onClose={handleClose}
        isOpen={isOpen.add}
      ></AddUserModelModal>

      <EditUserModelModal
        selectedModelId={selectedModelId!}
        selectedUserModel={selectedUserModel}
        onSuccessful={init}
        onClose={handleClose}
        isOpen={isOpen.edit}
      ></EditUserModelModal>
    </>
  );
}

export const getServerSideProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? DEFAULT_LANGUAGE, ['common', 'admin'])),
    },
  };
};
