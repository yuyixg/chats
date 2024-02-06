import React, { useEffect, useState } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Spinner,
} from '@nextui-org/react';
import { getUserModels, putUserModel } from '@/apis/adminService';
import { GetUserModelResult } from '@/types/admin';
import { IconPlus, IconX } from '@tabler/icons-react';
import { AddUserModelModal } from '@/components/Admin/addUserModelModal';
import toast from 'react-hot-toast';
import { EditUserModelModal } from '@/components/Admin/editUserModelModal';

export default function Models() {
  const [isOpen, setIsOpen] = useState({ add: false, edit: false });
  const [selectedUserModel, setSelectedUserModel] =
    useState<GetUserModelResult | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string>();
  const [userModels, setUserModels] = useState<GetUserModelResult[]>([]);
  const [loadingModel, setLoadingModel] = useState(false);
  useEffect(() => {
    setLoadingModel(true);
    init();
  }, []);

  const init = () => {
    getUserModels().then((data) => {
      setUserModels(data);
      setIsOpen({ add: false, edit: false });
      setSelectedUserModel(null);
      setLoadingModel(false);
    });
  };

  const disEnableUserModel = (item: GetUserModelResult, modelId: string) => {
    putUserModel({
      userModelId: item.userModelId,
      models: item.models.map((x) => {
        return x.modelId === modelId ? { ...x, enable: false } : x;
      }),
    })
      .then(() => {
        init();
        toast.success('Remove successful!');
      })
      .catch(() => {
        toast.error(
          'Remove failed! Please try again later, or contact technical personnel.'
        );
      });
  };

  const handleShowAddModal = (item: GetUserModelResult) => {
    setSelectedUserModel(item);
    setIsOpen({ add: true, edit: false });
  };

  const handleShowEditModal = (item: GetUserModelResult, modelId: string) => {
    setSelectedModelId(modelId);
    setSelectedUserModel(item);
    setIsOpen({ add: false, edit: true });
  };

  const handleClose = () => {
    setIsOpen({ add: false, edit: false });
    setSelectedUserModel(null);
  };

  const columns = [
    { name: 'USERNAME', uid: 'userName' },
    { name: 'ROLE', uid: 'role' },
    { name: 'MODELS', uid: 'models' },
  ];
  const renderCell = React.useCallback(
    (item: GetUserModelResult, columnKey: React.Key) => {
      switch (columnKey) {
        case 'userName':
          return <div>{item.userName}</div>;
        case 'role':
          return <div>{item.role}</div>;
        case 'models':
          return (
            <>
              {item.models
                .filter((x) => x.enable)
                .map((m) => {
                  return (
                    <Chip
                      onClick={() => {
                        handleShowEditModal(item, m.modelId);
                      }}
                      endContent={
                        <IconX
                          onClick={() => disEnableUserModel(item, m.modelId)}
                          size={16}
                        />
                      }
                      className='capitalize px-2 mx-1 my-1 cursor-pointer'
                      color='success'
                      size='sm'
                      variant='flat'
                    >
                      {m.modelId}
                    </Chip>
                  );
                })}
              <Chip
                onClick={() => handleShowAddModal(item)}
                endContent={<IconPlus size={16} />}
                className='capitalize px-2 mx-1 cursor-pointer'
                color={'default'}
                size='sm'
                variant='flat'
              >
                Add Model
              </Chip>
            </>
          );
        default:
          return <div></div>;
      }
    },
    []
  );

  return (
    <>
      <Table
        classNames={{
          table: loadingModel ? 'min-h-[320px]' : 'auto',
        }}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.uid}>{column.name}</TableColumn>
          )}
        </TableHeader>
        <TableBody
          loadingContent={<Spinner label='Loading...' />}
          isLoading={loadingModel}
          items={userModels}
        >
          {(item) => (
            <TableRow key={item.userId}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <AddUserModelModal
        selectedModel={selectedUserModel}
        onSuccessful={init}
        onClose={handleClose}
        isOpen={isOpen.add}
      ></AddUserModelModal>

      <EditUserModelModal
        selectedModelId={selectedModelId!}
        selectedUserModel={selectedUserModel}
        onSuccessful={init}
        onClose={handleClose}
        isOpen={isOpen.edit}
      ></EditUserModelModal>
    </>
  );
}

export const getServerSideProps = async ({ locale }: { locale: string }) => {
  return {
    props: {},
  };
};
