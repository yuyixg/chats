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
  const { isOpen, selectedModel, onClose, onSuccessful } = props;
  const [select, setSelect] = useState<GetModelResult>(selectedModel!);

  useEffect(() => {
    isOpen && setSelect(selectedModel!);
  }, [isOpen]);

  const handleSave = () => {
    putModels(select)
      .then((data) => {
        onSuccessful();
        toast.success('Save successful!');
      })
      .catch(() => {
        toast.error(
          'Save failed! Please try again later, or contact technical personnel.'
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
              Edit Model - {select?.modelId}
            </ModalHeader>
            <ModalBody>
              <div className='flex w-full justify-between items-center'>
                <Input
                  type='text'
                  label='Name'
                  labelPlacement={'outside'}
                  placeholder='Enter your Model Name'
                  value={select?.name}
                  onValueChange={(value) => {
                    onChange('name', value);
                  }}
                />
                <Switch
                  className='pt-[24px] px-2'
                  isSelected={select?.enable}
                  size='sm'
                  color='success'
                  onValueChange={(value) => {
                    onChange('enable', value);
                  }}
                >
                  {select?.enable ? 'Enabled' : 'Disabled'}
                </Switch>
              </div>
              <Textarea
                label='Api Configs'
                labelPlacement={'outside'}
                placeholder='Enter your Api Configs'
                value={select?.apiConfig}
                onValueChange={(value) => {
                  onChange('apiConfig', value);
                }}
              />
              <Textarea
                label='Model Configs'
                labelPlacement={'outside'}
                placeholder='Enter your Model Configs'
                value={select?.modelConfig}
                onValueChange={(value) => {
                  onChange('modelConfig', value);
                }}
              />
              <Textarea
                label='Img Configs'
                labelPlacement={'outside'}
                placeholder='Enter your Img Configs'
                value={select?.imgConfig}
                onValueChange={(value) => {
                  onChange('imgConfig', value);
                }}
              />
            </ModalBody>
            <ModalFooter>
              <Button color='danger' variant='light' onPress={onClose}>
                Close
              </Button>
              <Button color='primary' onPress={handleSave}>
                Save
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
