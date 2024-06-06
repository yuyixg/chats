import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { GetModelResult } from '@/types/admin';
import { DEFAULT_LANGUAGE } from '@/types/settings';
import { GetUserInitialConfigResult } from '@/types/user';

import { AddUserInitialConfigModal } from '@/components/Admin/Users/AddUserInitialConfigModal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  deleteUserInitialConfig,
  getModels,
  getUserInitialConfig,
} from '@/apis/adminService';

export default function UserInitialConfig() {
  const { t } = useTranslation('admin');
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [configList, setConfigList] = useState<GetUserInitialConfigResult[]>(
    [],
  );
  const [models, setModels] = useState<GetModelResult[]>([]);
  const [selectConfig, setSelectConfig] =
    useState<GetUserInitialConfigResult>();

  const [deleting, setDeleting] = useState(false);

  const handleShowAddModal = () => {
    setIsOpenModal(true);
  };

  const getConfigs = () => {
    getUserInitialConfig().then((data) => {
      setConfigList(data);
    });
  };

  const onDeleteConfig = (config: GetUserInitialConfigResult) => {
    setDeleting(true);
    deleteUserInitialConfig(config.id)
      .then(() => {
        toast.success(t('Delete successful!'));
        getConfigs();
      })
      .catch(() => {
        toast.error(
          t(
            'Operation failed! Please try again later, or contact technical personnel.',
          ),
        );
      })
      .finally(() => {
        setDeleting(false);
      });
  };

  useEffect(() => {
    getModels().then((data) => {
      setModels(data.filter((x) => x.enabled === true));
      getConfigs();
    });
  }, []);

  const NameCell = (
    config: GetUserInitialConfigResult,
    rowSpan: number = 1,
  ) => {
    return (
      <TableCell rowSpan={rowSpan}>
        <div className="flex items-center gap-2">
          <div>{config.name}</div>
        </div>
      </TableCell>
    );
  };

  const InitialPriceCell = (
    config: GetUserInitialConfigResult,
    rowSpan: number = 1,
  ) => {
    return (
      <TableCell rowSpan={rowSpan}>
        <div className="flex items-center gap-2">
          <div>{(+config.price).toFixed(2)}</div>
        </div>
      </TableCell>
    );
  };

  const LoginTypeCell = (
    config: GetUserInitialConfigResult,
    rowSpan: number = 1,
  ) => {
    return (
      <TableCell rowSpan={rowSpan}>
        <div className="flex items-center gap-2">
          <div>{config.loginType}</div>
        </div>
      </TableCell>
    );
  };

  const ModelCell = (value: any) => {
    return <TableCell>{value}</TableCell>;
  };

  const handleEditModal = (config: GetUserInitialConfigResult) => {
    setSelectConfig(config);
    setIsOpenModal(true);
  };

  const ActionCell = (config: GetUserInitialConfigResult, rowSpan: number) => {
    return (
      <TableCell rowSpan={rowSpan}>
        <div className="flex justify-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="link" className="text-red-500">
                {t('Delete')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[165px]">
              <div className="flex gap-4">
                <div>
                  <h4 className="pb-2">
                    {t('Are you sure you want to delete it?')}
                  </h4>
                  <div className='flex justify-end'>
                    <Button
                      disabled={deleting}
                      size="sm"
                      onClick={() => {
                        onDeleteConfig(config);
                      }}
                    >
                      {t('Confirm')}
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="link" onClick={() => handleEditModal(config)}>
            {t('Edit')}
          </Button>
        </div>
      </TableCell>
    );
  };

  return (
    <>
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex justify-end gap-3 items-center">
          <Button onClick={() => handleShowAddModal()} color="primary">
            {t('Add Account Initial Config')}
          </Button>
        </div>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow className="pointer-events-none">
              <TableHead rowSpan={2}>{t('Name')}</TableHead>
              <TableHead
                rowSpan={2}
                style={{ borderRight: '1px solid hsl(var(--muted))' }}
              >
                {t('Initial Price')}
              </TableHead>
              <TableHead
                rowSpan={2}
                style={{ borderRight: '1px solid hsl(var(--muted))' }}
              >
                {t('Login Type')}
              </TableHead>
              <TableHead colSpan={4} className="text-center">
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
              <TableHead>{t('Tokens')}</TableHead>
              <TableHead>{t('Chat Counts')}</TableHead>
              <TableHead>{t('Expiration Time')}</TableHead>
            </TableRow>
          </TableHeader>

          {configList.map((config) => (
            <TableBody
              emptyText={t('No data')!}
              key={config.id}
              className="tbody-hover"
              style={{ borderTop: '1px solid hsl(var(--muted))' }}
            >
              {config.models.length > 0 ? (
                config.models.map((model, index) => {
                  return (
                    <TableRow
                      key={model.modelId}
                      className={`${
                        index !== config.models.length - 1 && 'border-none'
                      }`}
                    >
                      {index === 0 && NameCell(config, config.models.length)}
                      {index === 0 &&
                        InitialPriceCell(config, config.models.length)}
                      {index === 0 &&
                        LoginTypeCell(config, config.models.length)}
                      {ModelCell(
                        models.find((x) => x.modelId === model.modelId)?.name,
                      )}
                      {ModelCell(model.tokens)}
                      {ModelCell(model.counts)}
                      {ModelCell(model.expires)}
                      {index === 0 && ActionCell(config, config.models.length)}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow key={config.id}>
                  {NameCell(config, config.models.length)}
                  {InitialPriceCell(config, config.models.length)}
                  {ModelCell(config.loginType)}
                  <TableCell colSpan={4}></TableCell>
                  {ActionCell(config, config.models.length)}
                </TableRow>
              )}
            </TableBody>
          ))}
        </Table>
      </Card>
      <AddUserInitialConfigModal
        models={models}
        select={selectConfig}
        onClose={() => {
          setIsOpenModal(false);
        }}
        onSuccessful={() => {
          getConfigs();
          setIsOpenModal(false);
        }}
        isOpen={isOpenModal}
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
