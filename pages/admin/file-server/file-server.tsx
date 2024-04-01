import React, { useEffect, useState } from 'react';
import { getFileServers } from '@/apis/adminService';
import { GetFileServerResult } from '@/types/admin';
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
import { FileServerModal } from '@/components/Admin/Files/FileServerModal';
import { DEFAULT_LANGUAGE } from '@/types/settings';

export default function FileServer() {
  const { t } = useTranslation('admin');
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<GetFileServerResult | null>(null);
  const [fileServers, setFileServers] = useState<GetFileServerResult[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    init();
  }, []);

  const init = () => {
    getFileServers().then((data) => {
      setFileServers(data);
      setIsOpen(false);
      setSelected(null);
      setLoading(false);
    });
  };

  const handleShow = (item: GetFileServerResult) => {
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
            <IconPlus size={20} />
            {t('Add File Server')}
          </Button>
        </div>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('Server Name')}</TableHead>
              <TableHead>{t('File Server Type')}</TableHead>
              <TableHead>{t('Created Time')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody isLoading={loading}>
            {fileServers.map((item) => (
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
      <FileServerModal
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
      ...(await serverSideTranslations(locale ?? DEFAULT_LANGUAGE, ['common', 'admin'])),
    },
  };
};
