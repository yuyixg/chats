import { putUserModel } from '@/apis/adminService';
import { UserModel } from '@/models/userModels';
import { GetUserModelResult } from '@/types/admin';
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Switch,
} from '@nextui-org/react';
import { useTranslation } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface IProps {
  isOpen: boolean;
  selectedModelId: string;
  selectedUserModel: GetUserModelResult | null;
  onClose: () => void;
  onSuccessful: () => void;
  saveLoading?: boolean;
}

export const EditUserModelModal = (props: IProps) => {
  const { t } = useTranslation('admin');
  const { isOpen, selectedUserModel, selectedModelId, onClose, onSuccessful } =
    props;
  const [select, setSelect] = useState<UserModel>();

  useEffect(() => {
    isOpen &&
      setSelect(
        selectedUserModel?.models.find((x) => x.modelId === selectedModelId)!
      );
  }, [isOpen]);

  const handleSave = () => {
    const models = selectedUserModel?.models.map((x) => {
      if (x.modelId === select?.modelId) {
        x.tokens = Number(select.tokens) || null;
        x.counts = Number(select.counts) || null;
        x.expires = select.expires || null;
      }
      return x;
    });
    putUserModel({
      userModelId: selectedUserModel?.userModelId!,
      models: models!,
    })
      .then(() => {
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

  const onChange = (key: keyof UserModel, value: string | boolean) => {
    setSelect((prev) => {
      return { ...prev!, [key]: value };
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
              {t('Edit Model')}
            </ModalHeader>
            <ModalBody>
              <Input
                type='text'
                label={`${t('ModeId')}`}
                labelPlacement={'outside'}
                value={select?.modelId}
                disabled
                onValueChange={(value) => {
                  onChange('modelId', value);
                }}
              />
              <Input
                label={t('Available Chat Tokens')}
                labelPlacement={'outside'}
                placeholder={`${t('Enter your')}${t('Available Chat Tokens')}`}
                value={`${select?.tokens || ''}`}
                onValueChange={(value) => {
                  onChange('tokens', value);
                }}
              />
              <Input
                label={t('Available Chat Counts')}
                labelPlacement={'outside'}
                placeholder={`${t('Enter your')}${t('Available Chat Counts')}`}
                value={`${select?.counts || ''}`}
                onValueChange={(value) => {
                  onChange('counts', value);
                }}
              />
              <Input
                label={t('Available Chat Expire Date')}
                labelPlacement={'outside'}
                placeholder={`${t('Enter your')}${t(
                  'Available Chat Expire Date'
                )}`}
                value={`${select?.expires || ''}`}
                onValueChange={(value) => {
                  onChange('expires', value);
                }}
              />
            </ModalBody>
            <ModalFooter>
              <Button color='danger' variant='light' onPress={onClose}>
                {t('Close')}
              </Button>
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
