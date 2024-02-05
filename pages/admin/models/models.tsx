import React, { useEffect, useState } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  Chip,
  Skeleton,
  Spinner,
} from '@nextui-org/react';
import { getUserModels, putUserModel } from '@/apis/adminService';
import { GetModelsResult, GetUsersModelsResult } from '@/types/admin';
import { IconPlus, IconSquareX } from '@tabler/icons-react';
import { AddModelModal } from '@/components/Admin/editModelModal';
import { LoadingState } from '@/types';

export default function Models() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModel, setSelectedModel] =
    useState<GetUsersModelsResult | null>(null);
  const [userModels, setUserModels] = useState<GetUsersModelsResult[]>([]);
  const [loadingModel, setLoadingModel] = useState(false);
  useEffect(() => {
    setLoadingModel(true);
    init();
  }, []);

  const init = () => {
    getUserModels().then((data) => {
      setUserModels(data);
      setIsOpen(false);
      setSelectedModel(null);
      setLoadingModel(false);
    });
  };

  const disEnableUserModel = (item: GetUsersModelsResult, modelId: string) => {
    putUserModel({
      userModelId: item.userModelId,
      models: item.models.map((x) => {
        return x.modelId === modelId ? { ...x, enable: false } : x;
      }),
    }).then(() => {
      init();
    });
  };

  const handleShowAddModal = (item: GetUsersModelsResult) => {
    setSelectedModel(item);
    setIsOpen(true);
  };

  const handleSave = (select: GetModelsResult) => {
    let models = selectedModel!.models;
    const foundModel = models.find((m) => m.modelId === select.modelId);
    if (!foundModel) {
      models.push({ modelId: select.modelId, enable: true });
    } else {
      models = models.map((x) => {
        return x.modelId === select.modelId ? { ...x, enable: true } : x;
      });
    }
    putUserModel({
      userModelId: selectedModel!.userModelId,
      models,
    }).then(() => {
      init();
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedModel(null);
  };

  const columns = [
    { name: 'USERNAME', uid: 'userName' },
    { name: 'ROLE', uid: 'role' },
    { name: 'MODELS', uid: 'models' },
  ];
  const renderCell = React.useCallback(
    (item: GetUsersModelsResult, columnKey: React.Key) => {
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
                      endContent={
                        <IconSquareX
                          onClick={() => disEnableUserModel(item, m.modelId)}
                          size={16}
                        />
                      }
                      className='capitalize px-2 mx-1 cursor-pointer'
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
                className='capitalize px-2 cursor-pointer'
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

      <AddModelModal
        selectedModel={selectedModel}
        onSave={handleSave}
        onClose={handleClose}
        isOpen={isOpen}
      ></AddModelModal>
    </>
  );
}

export const getServerSideProps = async ({ locale }: { locale: string }) => {
  return {
    props: {},
  };
};
