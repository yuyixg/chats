import React, { useEffect, useState } from 'react';
import { getFileServices } from '@/apis/adminService';
import { GetFileServicesResult } from '@/types/admin';
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
import { FileServiceModal } from '@/components/Admin/Files/FileServiceModal';
import { DEFAULT_LANGUAGE } from '@/types/settings';

export default function FileService() {
  const { t } = useTranslation('admin');
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<GetFileServicesResult | null>(null);
  const [fileServices, setFileServices] = useState<GetFileServicesResult[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    init();
  }, []);

  const init = () => {
    getFileServices().then((data) => {
      setFileServices(data);
      setIsOpen(false);
      setSelected(null);
      setLoading(false);
    });
  };

  const handleShow = (item: GetFileServicesResult) => {
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
            {t('Add File Service')}
          </Button>
        </div>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('Service Name')}</TableHead>
              <TableHead>{t('File Service Type')}</TableHead>
              <TableHead>{t('Created Time')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody
            emptyText={t('No data')!}
            isLoading={loading}
            isEmpty={fileServices.length === 0}
          >
            {fileServices.map((item) => (
              <TableRow
                className='cursor-pointer'
                key={item.id}
                onClick={() => {
                  handleShow(item);
                }}
              >
                <TableCell className='flex items-center gap-1'>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      item.enabled ? 'bg-green-400' : 'bg-gray-400'
                    }`}
                  ></div>
                  {item.name}
                </TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>
                  {new Date(item.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <FileServiceModal
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
