import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { useTranslation } from 'next-i18next';

import { GetModelResult, GetUserModelResult } from '@/types/admin';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { getModels, postUserModel, putUserModel } from '@/apis/adminApis';
import { termDateString } from '@/utils/common';

interface IProps {
  isOpen: boolean;
  selectedModel: GetUserModelResult | null;
  onClose: () => void;
  onSuccessful: () => void;
  saveLoading?: boolean;
}

export const AddUserModelModal = (props: IProps) => {
  const { t } = useTranslation('admin');
  const { isOpen, selectedModel, onClose, onSuccessful } = props;
  const [select, setSelect] = useState<GetModelResult>();
  const [models, setModel] = useState<GetModelResult[]>([]);
  const [submit, setSubmit] = useState(false);

  useEffect(() => {
    isOpen &&
      getModels().then((data) => {
        const _models = data.filter(
          (x) =>
            !selectedModel?.models
              .filter((m) => m.enabled)
              ?.find((m) => m.modelId === x.modelId) && x.enabled,
        );
        setModel(_models);
        setSubmit(false);
      });
    setSelect(undefined);
  }, [isOpen]);

  const handleSave = () => {
    setSubmit(true);
    let p: Promise<any> = null!;
    if (selectedModel) {
      let models = selectedModel!.models || [];
      const foundModel = models.find((m) => m.modelId === select?.modelId);
      if (!foundModel) {
        models.push({
          modelId: select?.modelId!,
          enabled: true,
          tokens: 0,
          counts: 0,
          expires: termDateString(),
        });
      } else {
        models = models.map((x) => {
          return x.modelId === select?.modelId ? { ...x, enabled: true } : x;
        });
      }
      p = putUserModel({
        models,
      });
    } else {
      p = postUserModel({
        userModelIds: userModelIds,
        modelId: select!.modelId,
      });
    }
    p.then(() => {
      onSuccessful();
      toast.success(t('Save successful!'));
    })
      .catch(() => {
        toast.error(
          t(
            'Operation failed! Please try again later, or contact technical personnel.',
          ),
        );
      })
      .finally(() => {
        setSubmit(false);
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('Add User Model')}</DialogTitle>
        </DialogHeader>
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
