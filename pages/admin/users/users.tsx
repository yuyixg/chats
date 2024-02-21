import React, { useEffect, useState } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Spinner,
  Tooltip,
  Accordion,
  AccordionItem,
  Input,
  Button,
} from '@nextui-org/react';
import { getUserModels, putUserModel } from '@/apis/adminService';
import { GetUserModelResult } from '@/types/admin';
import { IconChevronLeft, IconPlus, IconSearch } from '@tabler/icons-react';
import { AddUserModelModal } from '@/components/Admin/addUserModelModal';
import toast from 'react-hot-toast';
import { EditUserModelModal } from '@/components/Admin/editUserModelModal';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

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

  const handleShowAddModal = (
    item: GetUserModelResult,
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setSelectedUserModel(item);
    setIsOpen({ add: true, edit: false });
    e.preventDefault();
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
      <Accordion
        variant='splitted'
        selectionMode='multiple'
        style={{ padding: 0 }}
      >
        {userModels.map((item, index) => {
          return (
            <AccordionItem
              key={index}
              indicator={<IconChevronLeft size={20} />}
              title={
                <div className='flex w-full h-full justify-between items-center'>
                  <div>
                    <span className='text-base'>{item.userName}</span>
                    <span hidden={!item.role} className='text-gray-500 text-xs'>
                      {`   (${item.role})`}
                    </span>
                  </div>
                  <Button
                    size='sm'
                    color='primary'
                    variant='solid'
                    onClick={(e) => handleShowAddModal(item, e)}
                    startContent={<IconPlus size={20} />}
                  >
                    {t('Add Model')}
                  </Button>
                </div>
              }
            >
              <Table removeWrapper>
                <TableHeader>
                  <TableColumn>{t('ID')}</TableColumn>
                  <TableColumn>{t('Available Chat Tokens')}</TableColumn>
                  <TableColumn>{t('Available Chat Counts')}</TableColumn>
                  <TableColumn>{t('Available Chat Expire Date')}</TableColumn>
                </TableHeader>
                <TableBody>
                  {item.models.map((m) => {
                    return (
                      <TableRow key={m.modelId} className='hover:bg-gray-100'>
                        <TableCell
                          className='hover:underline'
                          onClick={() => handleShowEditModal(item, m.modelId)}
                        >
                          <Tooltip
                            content={m.enable ? t('Enabled') : t('Disabled')}
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
            </AccordionItem>
          );
        })}
      </Accordion>
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
