import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import useTranslation from '@/hooks/useTranslation';

import { IconInfo } from '@/components/Icons';
import Spinner from '@/components/Spinner';
import Tips from '@/components/Tips/Tips';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  getModelKeyPossibleModels,
  postModelFastCreate,
  postModelValidate,
} from '@/apis/adminApis';

interface IProps {
  modelKeyId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccessful: () => void;
}

export interface PossibleModel {
  referenceName: string;
  modelReferenceId: number;
  isExists: boolean;
  isLegacy: boolean;
  validating: boolean;
  validated: boolean;
  validateMessage: string | null;
  adding: boolean;
}

export const ConfigModelModal = (props: IProps) => {
  const { t } = useTranslation();
  const { modelKeyId, isOpen, onClose } = props;
  const [models, setModels] = useState<PossibleModel[]>([]);
  const [loading, setLoading] = React.useState(false);

  const onSave = async (index: number) => {
    const model = models[index];
    postModelFastCreate({
      modelKeyId: modelKeyId,
      modelReferenceId: model.modelReferenceId,
      deploymentName: null,
    });
  };

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getModelKeyPossibleModels(modelKeyId).then((data) => {
        setModels(
          data
            .sort((x) => (x.isLegacy ? -1 : 1))
            .sort((x) => (x.isExists ? 1 : -1))
            .map((x) => ({
              ...x,
              validating: false,
              validated: false,
              adding: false,
              validateMessage: null,
            })),
        );
        setLoading(false);
      });
    }
  }, [isOpen]);

  function handleAdd(index: number) {
    const model = models[index];
    const modelList = [...models];
    model.adding = true;
    setModels([...modelList.map((x, i) => (i === index ? model : x))]);
    postModelFastCreate({
      modelKeyId: modelKeyId,
      modelReferenceId: model.modelReferenceId,
      deploymentName: model.referenceName,
    }).then(() => {
      toast.success(t('Added successfully'));
      model.isExists = true;
      model.adding = false;
      setModels([...modelList.map((x, i) => (i === index ? model : x))]);
    });
  }

  function handleValidate(index: number) {
    const model = models[index];
    const modelList = [...models];
    model.validating = true;
    setModels([...modelList.map((x, i) => (i === index ? model : x))]);
    postModelValidate({
      modelKeyId: modelKeyId,
      modelReferenceId: model.modelReferenceId,
      deploymentName: model.referenceName,
    }).then((data) => {
      if (data.isSuccess) {
        toast.success(t('Verified Successfully'));
        model.validated = true;
      } else {
        toast.error(t('Verified Failed'));
        model.validateMessage = data.errorMessage;
      }
      model.validating = false;
      setModels([...modelList.map((x, i) => (i === index ? model : x))]);
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('Add Model')}</DialogTitle>
        </DialogHeader>
        <div className="h-96 overflow-scroll flex justify-start gap-2 flex-wrap">
          <Table>
            <TableHeader>
              <TableRow className="pointer-events-none">
                <TableHead>{t('Model Display Name')}</TableHead>
                <TableHead className="w-20">{t('Actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.map((model, index) => (
                <TableRow key={model.modelReferenceId}>
                  <TableCell>
                    {model.referenceName}
                    {model.isLegacy && (
                      <Badge variant="destructive" className="ml-2">
                        {t('Is Legacy')}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="flex gap-x-2">
                    {!model.isExists && (
                      <Button
                        variant="link"
                        disabled={model.adding}
                        className="p-0"
                        onClick={() => {
                          handleAdd(index);
                        }}
                      >
                        {t('Add Model')}
                      </Button>
                    )}
                    {model.validated ? (
                      <span className="text-green-600">{t('Validated')}</span>
                    ) : (
                      <div className="flex gap-x-2">
                        <Button
                          variant="link"
                          disabled={model.validating}
                          className="p-0"
                          onClick={() => {
                            handleValidate(index);
                          }}
                        >
                          {t('Validate Model')}
                        </Button>
                      </div>
                    )}
                    {model.validateMessage && (
                      <Tips
                        className="h-[28px]"
                        side="bottom"
                        trigger={
                          <Button variant="ghost" className="p-1 m-0 h-auto">
                            <IconInfo stroke="#FFD738" />
                          </Button>
                        }
                        content={
                          <div className="text-wrap w-80">
                            {model.validateMessage}
                          </div>
                        }
                      ></Tips>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {loading && (
          <div
            className={`fixed top-0 left-0 bottom-0 right-0 bg-white dark:bg-[#202123] text-black/80 dark:text-white/80 z-50 text-center text-[12.5px]`}
          >
            <div className="fixed w-screen h-screen top-1/2">
              <div className="flex justify-center">
                <Spinner className="text-gray-500 dark:text-gray-50" />
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
