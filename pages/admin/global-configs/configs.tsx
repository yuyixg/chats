import React, { useEffect, useState } from 'react';

import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { DEFAULT_LANGUAGE } from '@/types/settings';
import { GetConfigsResult } from '@/types/user';

import { GlobalConfigsModal } from '@/components/Admin/GlobalConfigs/GlobalConfigsModal';
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

import { getConfigs } from '@/apis/adminService';

export default function Configs() {
  const { t } = useTranslation('admin');
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<GetConfigsResult | null>(null);
  const [configs, setConfigs] = useState<GetConfigsResult[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    init();
  }, []);

  const init = () => {
    getConfigs().then((data) => {
      setConfigs(data);
      setIsOpen(false);
      setSelected(null);
      setLoading(false);
    });
  };

  const handleShow = (item: GetConfigsResult) => {
    setSelected(item);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelected(null);
  };

  return (
    <>
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex justify-end gap-3 items-center">
          <Button
            onClick={() => {
              setIsOpen(true);
            }}
            color="primary"
          >
            {t('Add Configs')}
          </Button>
        </div>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('Key')}</TableHead>
              <TableHead>{t('Value')}</TableHead>
              <TableHead>{t('Description')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody
            emptyText={t('No data')!}
            isLoading={loading}
            isEmpty={configs.length === 0}
          >
            {configs.map((item) => (
              <TableRow
                className="cursor-pointer"
                key={item.key}
                onClick={() => {
                  handleShow(item);
                }}
              >
                <TableCell>{item.key}</TableCell>
                <TableCell>{item.value}</TableCell>
                <TableCell>{item.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <GlobalConfigsModal
        selected={selected}
        isOpen={isOpen}
        onClose={handleClose}
        onSuccessful={init}
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
