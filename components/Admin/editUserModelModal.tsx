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
        x.enable = select.enable;
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
        {() => (
          <>
            <ModalHeader className='flex flex-col gap-1'>
              {t('Edit Model')}
            </ModalHeader>
            <ModalBody>
              <div className='flex w-full justify-between items-center'>
                <Input
                  type='text'
                  label={`${t('ID')}`}
                  labelPlacement={'outside'}
                  value={select?.modelId}
                  disabled
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
              {/* <Input
                type='text'
                label={`${t('ModeId')}`}
                labelPlacement={'outside'}
                value={select?.modelId}
                disabled
                onValueChange={(value) => {
                  onChange('modelId', value);
                }}
              /> */}
              <Input
                label={t('Remaining Tokens')}
                labelPlacement={'outside'}
                placeholder={`${t('Enter your')}${t('Remaining Tokens')}`}
                value={`${select?.tokens || ''}`}
                onValueChange={(value) => {
                  onChange('tokens', value);
                }}
              />
              <Input
                label={t('Remaining Counts')}
                labelPlacement={'outside'}
                placeholder={`${t('Enter your')}${t('Remaining Counts')}`}
                value={`${select?.counts || ''}`}
                onValueChange={(value) => {
                  onChange('counts', value);
                }}
              />
              <Input
                label={t('Expiration Time')}
                labelPlacement={'outside'}
                placeholder={`${t('Enter your')}${t('Expiration Time')}`}
                value={`${select?.expires || ''}`}
                onValueChange={(value) => {
                  onChange('expires', value);
                }}
              />
            </ModalBody>
            <ModalFooter>
              <Button color='primary' onClick={handleSave}>
                {t('Save')}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
