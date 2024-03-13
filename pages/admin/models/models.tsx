import React, { useEffect, useState } from 'react';
import { getModels } from '@/apis/adminService';
import { GetModelResult } from '@/types/admin';
import { EditModelModal } from '@/components/Admin/Models/EditModelModal';
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
import { IconPlus } from '@tabler/icons-react';

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
      <div className='flex flex-col gap-4 mb-4'>
        <div className='flex justify-end gap-3 items-center'>
          <Button onClick={() => {}} color='primary'>
            <IconPlus size={20} />
            {t('Add Model')}
          </Button>
        </div>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-20'>{t('Rank')}</TableHead>
              <TableHead>{t('Model Name')}</TableHead>
              <TableHead>{t('Model Version')}</TableHead>
              <TableHead>{t('Model Type')}</TableHead>
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
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.modelVersion}</TableCell>
                <TableCell>{item.type}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <EditModelModal
        selected={selectedModel}
        isOpen={isOpen}
        onClose={handleClose}
        onSuccessful={init}
      ></EditModelModal>
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
