import React, { useEffect, useState } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Card,
  CardHeader,
  Avatar,
  CardBody,
  CardFooter,
  Spinner,
} from '@nextui-org/react';
import { getUserModels } from '@/apis/adminService';
import { GetUserModelResult } from '@/types/admin';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { useThrottle } from '@/hooks/useThrottle';
import { UserModel } from '@/models/userModels';
import { AddUserModelModal } from '@/components/Admin/AddUserModelModal';
import { EditUserModelModal } from '@/components/Admin/EditUserModelModal';

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

  useEffect(() => {
    init();
  }, [throttledValue]);

  const init = () => {
    getUserModels(query).then((data) => {
      setUserModels(data);
      setIsOpen({ add: false, edit: false });
      setSelectedUserModel(null);
      setLoading(false);
    });
  };

  const handleShowAddModal = (item: GetUserModelResult) => {
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

  const columns = [
    { name: t('ID'), uid: 'modelId' },
    { name: t('Remaining Tokens'), uid: 'tokens' },
    { name: t('Remaining Counts'), uid: 'counts' },
    { name: t('Expiration Time'), uid: 'expires' },
  ];

  const renderCell = React.useCallback(
    (item: UserModel, columnKey: React.Key) => {
      switch (columnKey) {
        case 'modelId':
          return (
            <div className='text-small hover:underline'>{item.modelId}</div>
          );
        case 'tokens':
          return <div className='text-small'>{item.tokens || '-'}</div>;
        case 'counts':
          return <div className='text-small'>{item.counts || '-'}</div>;
        case 'expires':
          return <div className='text-small'>{item.expires || '-'}</div>;
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
            placeholder={t('Search...')!}
            startContent={<IconSearch className='text-default-300' />}
            value={query}
            onClear={() => setQuery('')}
            onValueChange={(value: string) => {
              setQuery(value);
            }}
          />
        </div>
      </div>
      <div className='grid w-full grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3'>
        {!loading &&
          userModels.map((item) => {
            return (
              <Card key={item.userId} className='p-2 max-h-[309px]'>
                <CardHeader className='justify-between'>
                  <div className='flex gap-4'>
                    <Avatar
                      icon={
                        <div className=' bg-gray-200 w-full h-full flex justify-center items-center font-semibold text-sm'>
                          {item.userName[0].toUpperCase()}
                        </div>
                      }
                    />
                    <div className='flex flex-col gap-1 items-start justify-center'>
                      <div className='py-1'>
                        <h4 className='text-small font-semibold leading-none text-default-600 capitalize'>
                          {item.userName}
                        </h4>
                        <h5 className='text-small tracking-tight text-default-400 capitalize'>
                          {item.role || '-'}
                        </h5>
                      </div>
                    </div>
                  </div>
                  <Button
                    color='primary'
                    size='sm'
                    variant='flat'
                    onClick={() => handleShowAddModal(item)}
                  >
                    <IconPlus size={18} />
                  </Button>
                </CardHeader>
                <CardBody className='px-3 py-0 text-small text-default-400'>
                  <Table removeWrapper>
                    <TableHeader columns={columns}>
                      {(column) => (
                        <TableColumn key={column.uid}>
                          {column.name}
                        </TableColumn>
                      )}
                    </TableHeader>
                    <TableBody
                      loadingContent={<Spinner label={t('Loading...')!} />}
                      isLoading={loading}
                      items={item.models.filter((x) => x.enable)}
                    >
                      {(model) => (
                        <TableRow
                          key={model.modelId}
                          className='hover:bg-gray-100 rounded-lg'
                        >
                          {(columnKey) => (
                            <TableCell
                              onClick={() =>
                                handleShowEditModal(item, model.modelId)
                              }
                            >
                              {renderCell(model, columnKey)}
                            </TableCell>
                          )}
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardBody>
                <CardFooter className='gap-3'></CardFooter>
              </Card>
            );
          })}
      </div>
      <AddUserModelModal
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
