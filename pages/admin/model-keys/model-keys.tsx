import React, { useEffect, useState } from 'react';
import { getModelKeys } from '@/apis/adminService';
import { GetModelKeysResult } from '@/types/admin';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconPlus } from '@/components/Icons/index';
import { DEFAULT_LANGUAGE } from '@/types/settings';
import { ModelKeysModal } from '@/components/Admin/ModelKeys/ModelKeysModal';
import { ModelType } from '@/types/model';
import { ModelProviderTemplates } from '@/types/template';

export default function ModelKeys() {
  const { t } = useTranslation('admin');
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<GetModelKeysResult | null>(null);
  const [services, setServices] = useState<GetModelKeysResult[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    init();
  }, []);

  const init = () => {
    getModelKeys().then((data) => {
      setServices(data);
      setIsOpen(false);
      setSelected(null);
      setLoading(false);
    });
  };

  const handleShow = (item: GetModelKeysResult) => {
    setSelected(item);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelected(null);
  };

  return (
    <>
      <div className='flex flex-col gap-4 mb-4'>
        <div className='flex justify-end gap-3 items-center'>
          <Button
            onClick={() => {
              setIsOpen(true);
            }}
            color='primary'
          >
            <IconPlus stroke='white' />
            {t('Add Model Keys')}
          </Button>
        </div>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('Key Name')}</TableHead>
              <TableHead>{t('Model Provider')}</TableHead>
              <TableHead>{t('Created Time')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody
            emptyText={t('No data')!}
            isLoading={loading}
            isEmpty={services.length === 0}
          >
            {services.map((item) => (
              <TableRow
                className='cursor-pointer'
                key={item.id}
                onClick={() => {
                  handleShow(item);
                }}
              >
                <TableCell className='flex items-center gap-1'>
                  {item.name}
                </TableCell>
                <TableCell>{ModelProviderTemplates[item.type].displayName}</TableCell>
                <TableCell>
                  {new Date(item.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <ModelKeysModal
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
