import React, { useEffect, useState } from 'react';
import { getModels } from '@/apis/adminService';
import { GetModelResult } from '@/types/admin';
import { ModelModal } from '@/components/Admin/ModelModal';
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

export default function Models() {
  const { t } = useTranslation('admin');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<GetModelResult | null>(
    null
  );
  const [models, setModels] = useState<GetModelResult[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    init();
  }, []);

  const init = () => {
    getModels().then((data) => {
      setModels(data);
      setIsOpen(false);
      setSelectedModel(null);
      setLoading(false);
    });
  };

  const handleShow = (item: GetModelResult) => {
    setSelectedModel(item);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedModel(null);
  };

  return (
    <>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-20'>{t('Rank')}</TableHead>
              <TableHead>{t('Model Type')}</TableHead>
              <TableHead>{t('Model Name')}</TableHead>
              <TableHead>{t('ID')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {models.map((item) => (
              <TableRow
                onClick={() => {
                  handleShow(item);
                }}
              >
                <TableCell>{item.rank}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.modelId}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <ModelModal
        selected={selectedModel}
        isOpen={isOpen}
        onClose={handleClose}
        onSuccessful={init}
      ></ModelModal>
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
