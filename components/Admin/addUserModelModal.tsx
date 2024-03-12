import { getModels, putUserModel } from '@/apis/adminService';
import { GetModelResult, GetUserModelResult } from '@/types/admin';
import { useTranslation } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Button } from '../ui/button';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    isOpen &&
      getModels().then((data) => {
        const _models = data.filter(
          (x) =>
            !selectedModel?.models
              .filter((x) => x.enable)
              ?.find((m) => m.modelId === x.modelId)
        );
        setModel(_models);
        setLoading(false);
      });
    setSelect(undefined);
  }, [isOpen]);

  const handleSave = () => {
    let models = selectedModel!.models || [];
    const foundModel = models.find((m) => m.modelId === select?.modelId);
    if (!foundModel) {
      models.push({ modelId: select?.modelId!, enable: true });
    } else {
      models = models.map((x) => {
        return x.modelId === select?.modelId ? { ...x, enable: true } : x;
      });
    }
    putUserModel({
      userModelId: selectedModel!.userModelId,
      models,
    })
      .then(() => {
        toast.success(t('Save successful!'));
        onSuccessful();
      })
      .catch(() => {
        toast.error(
          t(
            'Save failed! Please try again later, or contact technical personnel.'
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
                {model.modelId}
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
