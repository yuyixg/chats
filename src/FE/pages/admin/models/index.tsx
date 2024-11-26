import React, { useEffect, useState } from 'react';

import useTranslation from '@/hooks/useTranslation';

import { formatNumberAsMoney } from '@/utils/common';

import { AdminModelDto, GetModelKeysResult } from '@/types/adminApis';

import { AddModelModal } from '@/components/Admin/Models/AddModelModal';
import { EditModelModal } from '@/components/Admin/Models/EditModelModal';
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

import { getModelKeys, getModels } from '@/apis/adminApis';
import { feModelProviders } from '@/types/model';

export default function Models() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState({ add: false, edit: false });
  const [selectedModel, setSelectedModel] = useState<AdminModelDto>();
  const [models, setModels] = useState<AdminModelDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modelKeys, setModelKeys] = useState<GetModelKeysResult[]>([]);

  useEffect(() => {
    init();
  }, []);

  const init = () => {
    getModels().then((data) => {
      setModels(data);
      setIsOpen({ add: false, edit: false });
      setSelectedModel(undefined);
      setLoading(false);
    });
    getModelKeys().then((data) => {
      setModelKeys(data);
    });
  };

  const showEditDialog = (item: AdminModelDto) => {
    setSelectedModel(item);
    setIsOpen({ ...isOpen, edit: true });
  };

  const showCreateDialog = () => {
    setIsOpen({ ...isOpen, add: true });
  };

  const handleClose = () => {
    setIsOpen({ add: false, edit: false });
    setSelectedModel(undefined);
  };

  return (
    <>
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex justify-end gap-3 items-center">
          <Button
            onClick={() => { showCreateDialog(); }}
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
              <TableHead>{t('Token Price')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody isLoading={loading} isEmpty={models.length === 0}>
            {models.map((item) => (
              <TableRow
                className="cursor-pointer"
                key={item.modelId}
                onClick={() => showEditDialog(item)}
              >
                <TableCell>{item.rank}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 ">
                    <div
                      className={`w-2 h-2 rounded-full ${item.enabled ? 'bg-green-400' : 'bg-gray-400'
                        }`}
                    ></div>
                    {item.name}
                  </div>
                </TableCell>
                <TableCell>
                  {t(feModelProviders[item.modelProviderId].name)}
                </TableCell>
                <TableCell>{item.modelReferenceName}</TableCell>
                <TableCell>
                  {'￥' +
                    formatNumberAsMoney(item.inputTokenPrice1M) +
                    '/' +
                    formatNumberAsMoney(item.outputTokenPrice1M)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      {isOpen.edit && (
        <EditModelModal
          selected={selectedModel!}
          modelKeys={modelKeys}
          isOpen={isOpen.edit}
          onClose={handleClose}
          onSuccessful={init}
        />
      )}
      {isOpen.add && (
        <AddModelModal
          modelKeys={modelKeys}
          isOpen={isOpen.add}
          onClose={handleClose}
          onSuccessful={init}
        />
      )}
    </>
  );
}
