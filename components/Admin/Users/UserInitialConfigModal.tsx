import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { useTranslation } from 'next-i18next';

import { GetModelResult, GetUserModelResult } from '@/types/admin';
import { GetUserInitialConfigResult, UserInitialModel } from '@/types/user';

import { Button } from '../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '../../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';

import { getModels, postUserModel, putUserModel } from '@/apis/adminService';
import { getUserInitialConfig, putUserInitialConfig } from '@/apis/userService';
import { UserInitialConfig } from '@prisma/client';

interface IProps {
  isOpen: boolean;
  selectedModel: GetUserModelResult | null;
  userModelIds: string[];
  onClose: () => void;
  onSuccessful: () => void;
  saveLoading?: boolean;
}

export const UserInitialModal = (props: IProps) => {
  const { t } = useTranslation('admin');
  const { isOpen } = props;
  const [select, setSelect] = useState<GetUserInitialConfigResult>();
  const [models, setModel] = useState<GetModelResult[]>([]);
  const [submit, setSubmit] = useState(false);

  useEffect(() => {
    isOpen &&
      getUserInitialConfig().then((config) => {
        setSelect(config);
        getModels().then((data) => {
          const _models = data.filter(
            (x) =>
              !config.models
                .filter((m) => m.enabled)
                ?.find((m) => m.modelId === x.modelId) && x.enabled,
          );
          setModel(_models);
          setSubmit(false);
        });
      });
  }, [isOpen]);

  const handleSave = () => {
    // putUserInitialConfig({})
    //   .then(() => {
    //     toast.success(t('Save successful!'));
    //   })
    //   .catch(() => {
    //     toast.error(
    //       t(
    //         'Operation failed! Please try again later, or contact technical personnel.',
    //       ),
    //     );
    //   })
    //   .finally(() => {
    //     setSubmit(false);
    //   });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>{t('Add User Model')}</DialogHeader>
        <Select
          value={select?.modelId}
          onValueChange={(value) => {
            setSelect(models.find((x) => x.modelId === value));
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={`${t('Select an Model')}`} />
          </SelectTrigger>
          <SelectContent>
            {models.map((model) => (
              <SelectItem key={model.modelId} value={model.modelId}>
                {model.name}
                {model.remarks && ` - ${model.remarks}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button disabled={!select || submit} onClick={handleSave}>
            {t('Save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
