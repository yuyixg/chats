import React, { useEffect, useState } from 'react';

import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { GetModelResult } from '@/types/admin';
import { DEFAULT_LANGUAGE } from '@/types/settings';
import { ModelProviderTemplates } from '@/types/template';

import { AddModelModal } from '@/components/Admin/Models/AddModelModal';
import { EditModelModal } from '@/components/Admin/Models/EditModelModal';
import { IconDots } from '@/components/Icons/index';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { getModels } from '@/apis/adminService';

export default function Models() {
  const { t } = useTranslation('admin');
  const [isOpen, setIsOpen] = useState({ add: false, edit: false });
  const [selectedModel, setSelectedModel] = useState<GetModelResult | null>(
    null,
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
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex justify-end gap-3 items-center">
          <Button
            onClick={() => {
              setIsOpen({ ...isOpen, add: true });
            }}
            color="primary"
          >
            {t('Add Model')}
          </Button>
        </div>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">{t('Rank')}</TableHead>
              <TableHead>{t('Model Display Name')}</TableHead>
              <TableHead>{t('Model Provider')}</TableHead>
              <TableHead>{t('Model Version')}</TableHead>
              <TableHead>{t('Remarks')}</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody
            emptyText={t('No data')!}
            isLoading={loading}
            isEmpty={models.length === 0}
          >
            {models.map((item) => (
              <TableRow
                className="cursor-pointer"
                key={item.modelId}
                onClick={() => handleShow(item)}
              >
                <TableCell>{item.rank}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 ">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        item.enabled ? 'bg-green-400' : 'bg-gray-400'
                      }`}
                    ></div>
                    {item.name}
                  </div>
                </TableCell>
                <TableCell>
                  {ModelProviderTemplates[item.modelProvider].displayName}
                </TableCell>
                <TableCell>{item.modelVersion}</TableCell>
                <TableCell>{item.remarks}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost">
                        <IconDots size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleShow(item)}>
                        {t('Edit')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      {isOpen.edit && (
        <EditModelModal
          selected={selectedModel!}
          isOpen={isOpen.edit}
          onClose={handleClose}
          onSuccessful={init}
        />
      )}
      {isOpen.add && (
        <AddModelModal
          isOpen={isOpen.add}
          onClose={handleClose}
          onSuccessful={init}
        />
      )}
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
