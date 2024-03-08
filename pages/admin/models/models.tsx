import React, { useEffect, useState } from 'react';
import { getModels } from '@/apis/adminService';
import { GetModelResult } from '@/types/admin';
import { EditModelModal } from '@/components/Admin/editModelModal';
import { IconPencil } from '@tabler/icons-react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
    setIsOpen(true);
    setSelectedModel(item);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedModel(null);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-20'>{t('Rank')}</TableHead>
            <TableHead>{t('Model Type')}</TableHead>
            <TableHead>{t('Model Name')}</TableHead>
            <TableHead>{t('ID')}</TableHead>
            <TableHead>{t('Actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {models.map((item) => (
            <TableRow>
              <TableCell>{item.rank}</TableCell>
              <TableCell>{item.type}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.modelId}</TableCell>
              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <IconPencil
                        onClick={() => {
                          handleShow(item);
                        }}
                        className='text-default-400'
                        size={20}
                      />
                    </TooltipTrigger>
                    <TooltipContent>{t('Edit')}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <EditModelModal
        selectedModel={selectedModel}
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
