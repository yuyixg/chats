import React, { useEffect, useState } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Tooltip,
  Accordion,
  AccordionItem,
  Input,
  Button,
  Card,
  CardHeader,
  Avatar,
  CardBody,
  CardFooter,
} from '@nextui-org/react';
import { getUserModels, putUserModel } from '@/apis/adminService';
import { GetUserModelResult } from '@/types/admin';
import {
  IconChevronLeft,
  IconPlus,
  IconSearch,
  IconUser,
} from '@tabler/icons-react';
import { AddUserModelModal } from '@/components/Admin/addUserModelModal';
import toast from 'react-hot-toast';
import { EditUserModelModal } from '@/components/Admin/editUserModelModal';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { getSession } from '@/utils/session';

export default function Models() {
  const { t } = useTranslation('admin');
  const [isOpen, setIsOpen] = useState({ add: false, edit: false });
  const [selectedUserModel, setSelectedUserModel] =
    useState<GetUserModelResult | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string>();
  const [userModels, setUserModels] = useState<GetUserModelResult[]>([]);
  const [loadingModel, setLoadingModel] = useState(false);
  useEffect(() => {
    setLoadingModel(true);
    init();
  }, []);

  const init = () => {
    getUserModels().then((data) => {
      setUserModels(data);
      setIsOpen({ add: false, edit: false });
      setSelectedUserModel(null);
      setLoadingModel(false);
    });
  };

  const disEnableUserModel = (item: GetUserModelResult, modelId: string) => {
    putUserModel({
      userModelId: item.userModelId,
      models: item.models.map((x) => {
        return x.modelId === modelId ? { ...x, enable: false } : x;
      }),
    })
      .then(() => {
        init();
        toast.success('Remove successful!');
      })
      .catch(() => {
        toast.error(
          'Remove failed! Please try again later, or contact technical personnel.'
        );
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

  return (
    <>
      <div className='flex flex-col gap-4 mb-4'>
        <div className='flex justify-between gap-3 items-center'>
          <Input
            isClearable
            classNames={{
              base: 'w-full',
            }}
            placeholder='Search by name...'
            startContent={<IconSearch className='text-default-300' />}
            // value={filterValue}
            // onClear={() => setFilterValue('')}
            // onValueChange={onSearchChange}
          />
        </div>
      </div>
      <div className='grid w-full grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3'>
        {userModels.map(
          (item, index) => {
            return (
              <Card className='p-2'>
                <CardHeader className='justify-between'>
                  <div className='flex gap-5'>
                    <Avatar
                      isBordered
                      // color='success'
                      icon={
                        <div className=' bg-gray-200 w-full h-full flex justify-center items-center font-semibold text-sm'>
                          {item.userName[0].toUpperCase()}
                        </div>
                      }
                    />
                    <div className='flex flex-col gap-1 items-start justify-center'>
                      <h4 className='text-small font-semibold leading-none text-default-600'>
                        {item.userName}
                      </h4>
                      <h5 className='text-small tracking-tight text-default-400'>
                        {item.role || '-'}
                      </h5>
                    </div>
                  </div>
                  <Button
                    color='primary'
                    radius='full'
                    size='sm'
                    variant='solid'
                    onClick={() => handleShowAddModal(item)}
                  >
                    <IconPlus size={18} />
                  </Button>
                </CardHeader>
                <CardBody className='px-3 py-0 text-small text-default-400'>
                  <Table removeWrapper>
                    <TableHeader>
                      <TableColumn>{t('ID')}</TableColumn>
                      <TableColumn>{t('Remaining Tokens')}</TableColumn>
                      <TableColumn>{t('Remaining Counts')}</TableColumn>
                      <TableColumn>{t('Expiration Time')}</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {item.models
                        .filter((x) => x.enable)
                        .map((m) => {
                          return (
                            <TableRow
                              key={m.modelId}
                              className='hover:bg-gray-100'
                            >
                              <TableCell
                                className='hover:underline'
                                onClick={() =>
                                  handleShowEditModal(item, m.modelId)
                                }
                              >
                                <Tooltip
                                  content={
                                    m.enable ? t('Enabled') : t('Disabled')
                                  }
                                >
                                  <Chip
                                    className='capitalize border-none gap-1 text-default-600'
                                    color={m.enable ? 'success' : 'default'}
                                    size='sm'
                                    variant='dot'
                                  ></Chip>
                                </Tooltip>
                                {m.modelId}
                              </TableCell>
                              <TableCell>{m.tokens || '-'}</TableCell>
                              <TableCell>{m.counts || '-'}</TableCell>
                              <TableCell>{m.expires || '-'}</TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </CardBody>
                <CardFooter className='gap-3'></CardFooter>
              </Card>
            );
          }
        )}
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
