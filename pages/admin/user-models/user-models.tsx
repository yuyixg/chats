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
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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

  const handleShowEditModal = (item: GetUserModelResult, modelId: string) => {
    setSelectedModelId(modelId);
    setSelectedUserModel(item);
    setIsOpen({ add: false, edit: true });
  };

  const handleClose = () => {
    setIsOpen({ add: false, edit: false });
    setSelectedUserModel(null);
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
            key='show-batch-add-modal'
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
      <div className='grid w-full grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3'>
        {userModels.map((item) => {
          return (
            <Card
              key={item.userId}
              className='p-2 max-h-[309px] overflow-hidden'
            >
              <CardHeader>
                <div className='flex gap-4'>
                  <div className='flex w-full justify-between'>
                    <div className='py-1 gap-2 w-[50%] flex items-center'>
                      <Avatar>
                        <AvatarFallback>
                          {item.userName[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className='text-sm leading-none text-default-600 capitalize'>
                        <div className='font-semibold'>{item.userName}</div>

                        <div className='text-xs tracking-tight text-default-400 capitalize'>
                          {item.role || '-'}
                        </div>
                      </div>
                    </div>
                    <Button
                      key='show-add-model'
                      variant='outline'
                      onClick={() => handleShowAddModal(item)}
                    >
                      <IconPlus size={18} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='px-3 py-0 text-small text-default-400 overflow-auto max-h-[200px]'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('ID')}</TableHead>
                      <TableHead>{t('Remaining Tokens')}</TableHead>
                      <TableHead>{t('Remaining Counts')}</TableHead>
                      <TableHead>{t('Expiration Time')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {item.models
                      .filter((x) => x.enable)
                      .map((model) => (
                        <TableRow
                          onClick={() =>
                            handleShowEditModal(item, model.modelId)
                          }
                        >
                          <TableCell>{model.modelName}</TableCell>
                          <TableCell>{model.tokens}</TableCell>
                          <TableCell>{model.counts}</TableCell>
                          <TableCell>{model.expires}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })}
      </div>
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
      ...(await serverSideTranslations(locale ?? 'en', ['common', 'admin'])),
    },
  };
};
