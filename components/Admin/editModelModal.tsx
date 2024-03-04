import { putModels } from '@/apis/adminService';
import { GetModelResult } from '@/types/admin';
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Switch,
  Textarea,
} from '@nextui-org/react';
import { useTranslation } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface IProps {
  isOpen: boolean;
  selectedModel: GetModelResult | null;
  onClose: () => void;
  onSuccessful: () => void;
  saveLoading?: boolean;
}

export const EditModelModal = (props: IProps) => {
  const { t } = useTranslation('admin');
  const { isOpen, selectedModel, onClose, onSuccessful } = props;
  const [select, setSelect] = useState<GetModelResult>(selectedModel!);

  useEffect(() => {
    isOpen && setSelect(selectedModel!);
  }, [isOpen]);

  const handleSave = () => {
    putModels(select)
      .then((data) => {
        onSuccessful();
        toast.success(t('Save successful!'));
      })
      .catch(() => {
        toast.error(
          t(
            'Save failed! Please try again later, or contact technical personnel.'
          )
        );
      });
  };

  const onChange = (key: keyof GetModelResult, value: string | boolean) => {
    setSelect((prev) => {
      return { ...prev, [key]: value };
    });
  };

  return (
    <Modal
      backdrop='transparent'
      placement='top'
      isOpen={isOpen}
      onClose={onClose}
      size='3xl'
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'>
              {t('Edit Model')} - {select?.modelId}
            </ModalHeader>
            <ModalBody>
              <div className='flex w-full justify-between items-center'>
                <Input
                  type='text'
                  label={`${t('MODEL NAME')}`}
                  labelPlacement={'outside'}
                  placeholder={`${t('Enter your')} ${t('MODEL NAME')}`}
                  value={select?.name}
                  onValueChange={(value) => {
                    onChange('name', value);
                  }}
                />
                <Switch
                  style={{ minWidth: '128px' }}
                  className='pt-[24px] px-2'
                  isSelected={select?.enable}
                  size='sm'
                  color='primary'
                  onValueChange={(value) => {
                    onChange('enable', value);
                  }}
                >
                  {select?.enable ? t('Enabled') : t('Disabled')}
                </Switch>
              </div>
              <Textarea
                label={`${t('API Configs')}`}
                labelPlacement={'outside'}
                placeholder={`${t('Enter your')}${t('API Configs')}`}
                value={select?.apiConfig}
                onValueChange={(value) => {
                  onChange('apiConfig', value);
                }}
              />
              <Textarea
                label={`${t('Model Configs')}`}
                labelPlacement={'outside'}
                placeholder={`${t('Enter your')}${t('Model Configs')}`}
                value={select?.modelConfig}
                onValueChange={(value) => {
                  onChange('modelConfig', value);
                }}
              />
              <Textarea
                label={`${t('Image Configs')}`}
                labelPlacement={'outside'}
                placeholder={`${t('Enter your')}${t('Image Configs')}`}
                value={select?.imgConfig}
                onValueChange={(value) => {
                  onChange('imgConfig', value);
                }}
              />
            </ModalBody>
            <ModalFooter>
              <Button color='primary' onPress={handleSave}>
                {t('Save')}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
