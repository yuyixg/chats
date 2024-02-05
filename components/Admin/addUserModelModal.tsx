import { getModels } from '@/apis/adminService';
import { GetModelsResult, GetUsersModelsResult } from '@/types/admin';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from '@nextui-org/react';
import React, { useEffect, useState } from 'react';

interface IProps {
  isOpen: boolean;
  selectedModel: GetUsersModelsResult | null;
  onClose: () => void;
  onSave: (model: GetModelsResult) => void;
  saveLoading?: boolean;
}

export const AddUserModelModal = (props: IProps) => {
  const { isOpen, selectedModel, onClose, onSave } = props;
  const [select, setSelect] = useState<GetModelsResult>();
  const [models, setModel] = useState<GetModelsResult[]>([]);
  
  useEffect(() => {
    isOpen &&
      getModels().then((data) => {
        const _models = data.filter(
          (x) =>
            !selectedModel?.models.find(
              (m) => m.modelId === x.modelId && m.enable
            )
        );
        setModel(_models);
      });
  }, [isOpen]);

  const handleSave = () => {
    select && onSave(select);
  };

  return (
    <Modal
      backdrop='transparent'
      placement='top'
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'>Add Model</ModalHeader>
            <ModalBody>
              <Select
                value={select?.modelId}
                labelPlacement='outside'
                label='Select an Model'
                onChange={(ev) => {
                  setSelect(models.find((x) => x.modelId === ev.target.value));
                }}
              >
                {models.map((model) => (
                  <SelectItem key={model.modelId} value={model.modelId}>
                    {model.modelId}
                  </SelectItem>
                ))}
              </Select>
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
