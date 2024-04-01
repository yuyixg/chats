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
import { AddModelModal } from '@/components/Admin/Models/AddModelModal';
import { DEFAULT_LOCALE } from '@/types/settings';

export default function Models() {
  const { t } = useTranslation('admin');
  const [isOpen, setIsOpen] = useState({ add: false, edit: false });
  const [selectedModel, setSelectedModel] = useState<GetModelResult | null>(
    null
  );
  const [models, setModels] = useState<GetModelResult[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    init();
  }, []);

  const init = () => {
    getModels().then((data) => {
      setModels(data);
      setIsOpen({ add: false, edit: false });
      setSelectedModel(null);
      setLoading(false);
    });
  };

  const handleShow = (item: GetModelResult) => {
    setSelectedModel(item);
    setIsOpen({ ...isOpen, edit: true });
  };

  const handleClose = () => {
    setIsOpen({ add: false, edit: false });
    setSelectedModel(null);
  };

  return (
    <>
      <div className='flex flex-col gap-4 mb-4'>
        <div className='flex justify-end gap-3 items-center'>
          <Button
            onClick={() => {
              setIsOpen({ ...isOpen, add: true });
            }}
            color='primary'
          >
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
              <TableHead>{t('Model Display Name')}</TableHead>
              <TableHead>{t('Model Version')}</TableHead>
              <TableHead>{t('Model Type')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody isLoading={loading}>
            {models.map((item) => (
              <TableRow
                className='cursor-pointer'
                key={item.modelId}
                onClick={() => {
                  handleShow(item);
                }}
              >
                <TableCell>{item.rank}</TableCell>
                <TableCell className='flex items-center gap-1'>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      item.enabled ? 'bg-green-400' : 'bg-gray-400'
                    }`}
                  ></div>
                  {item.name}
                </TableCell>
                <TableCell>{item.modelVersion}</TableCell>
                <TableCell>{item.type}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <EditModelModal
        selected={selectedModel}
        isOpen={isOpen.edit}
        onClose={handleClose}
        onSuccessful={init}
      />
      <AddModelModal
        isOpen={isOpen.add}
        onClose={handleClose}
        onSuccessful={init}
      />
    </>
  );
}

export const getServerSideProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? DEFAULT_LOCALE, ['common', 'admin'])),
    },
  };
};
