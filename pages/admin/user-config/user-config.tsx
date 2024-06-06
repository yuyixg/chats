import React, { useEffect, useState } from 'react';

import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { GetModelResult } from '@/types/admin';
import { DEFAULT_LANGUAGE } from '@/types/settings';
import { GetUserInitialConfigResult } from '@/types/user';

import { AddUserInitialConfigModal } from '@/components/Admin/Users/AddUserInitialConfigModal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { getModels, getUserInitialConfig } from '@/apis/adminService';

export default function UserInitialConfig() {
  const { t } = useTranslation('admin');
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [configList, setConfigList] = useState<GetUserInitialConfigResult[]>(
    [],
  );

  const [models, setModels] = useState<GetModelResult[]>([]);
  const [selectConfig, setSelectConfig] =
    useState<GetUserInitialConfigResult>();
  const handleShowAddModal = () => {
    setIsOpenModal(true);
  };

  useEffect(() => {
    getModels().then((data) => {
      setModels(data.filter((x) => x.enabled === true));
      getUserInitialConfig().then((data) => {
        setConfigList(data);
      });
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

  const ProviderCell = (
    config: GetUserInitialConfigResult,
    rowSpan: number = 1,
  ) => {
    return (
      <TableCell rowSpan={rowSpan}>
        <div className="flex items-center gap-2">
          <div>{config.provider}</div>
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

  const ActionCell = (
    config: GetUserInitialConfigResult,
    rowSpan: number = 1,
  ) => {
    return (
      <TableCell rowSpan={rowSpan}>
        <Button variant="link" onClick={() => handleEditModal(config)}>
          {t('Edit')}
        </Button>
        <Button variant="link" className="text-red-500" onClick={() => {}}>
          {t('Delete')}
        </Button>
      </TableCell>
    );
  };

  return (
    <>
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex justify-between gap-3 items-center">
          <Button onClick={() => handleShowAddModal()} color="primary">
            {t('Add User Initial Config')}
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
                {t('Provider')}
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
              <TableHead>{t('Counts')}</TableHead>
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
              {config.models.map((model, index) => {
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
                    {index === 0 && ProviderCell(config, config.models.length)}
                    {ModelCell(
                      models.find((x) => x.modelId === model.modelId)?.name,
                    )}
                    {ModelCell(model.tokens)}
                    {ModelCell(model.counts)}
                    {ModelCell(model.expires)}
                    {index === 0 && ActionCell(config, config.models.length)}
                  </TableRow>
                );
              })}
            </TableBody>
          ))}
        </Table>
      </Card>
      <AddUserInitialConfigModal
        select={selectConfig}
        onClose={() => {
          setIsOpenModal(false);
        }}
        onSuccessful={() => {
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
