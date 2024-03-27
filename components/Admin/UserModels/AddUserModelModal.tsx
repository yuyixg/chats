import { getModels, postUserModel, putUserModel } from '@/apis/adminService';
import { GetModelResult, GetUserModelResult } from '@/types/admin';
import { useTranslation } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
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
import { Button } from '../../ui/button';

interface IProps {
  isOpen: boolean;
  selectedModel: GetUserModelResult | null;
  userModelIds: string[];
  onClose: () => void;
  onSuccessful: () => void;
  saveLoading?: boolean;
}

export const AddUserModelModal = (props: IProps) => {
  const { t } = useTranslation('admin');
  const { isOpen, selectedModel, userModelIds, onClose, onSuccessful } = props;
  const [select, setSelect] = useState<GetModelResult>();
  const [models, setModel] = useState<GetModelResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    isOpen &&
      getModels().then((data) => {
        const _models = data.filter(
          (x) =>
            !selectedModel?.models
              .filter((m) => m.enabled)
              ?.find((m) => m.modelId === x.modelId) && x.enabled
        );
        setModel(_models);
        setLoading(false);
      });
    setSelect(undefined);
  }, [isOpen]);

  const handleSave = () => {
    let p = null;
    if (selectedModel) {
      let models = selectedModel!.models || [];
      const foundModel = models.find((m) => m.modelId === select?.modelId);
      if (!foundModel) {
        models.push({ modelId: select?.modelId!, enabled: true });
      } else {
        models = models.map((x) => {
          return x.modelId === select?.modelId ? { ...x, enabled: true } : x;
        });
      }
      p = putUserModel({
        userModelId: selectedModel!.userModelId,
        models,
      });
    } else {
      p = postUserModel({
        userModelIds: userModelIds,
        modelId: select!.modelId,
      });
    }
    p.then(() => {
      toast.success(t('Save successful!'));
      onSuccessful();
    }).catch(() => {
      toast.error(
        t(
          'Operation failed! Please try again later, or contact technical personnel.'
        )
      );
    });
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
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button disabled={!select} onClick={handleSave}>
            {t('Save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
