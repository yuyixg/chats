import React, { useEffect, useState } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Tooltip,
  Chip,
} from '@nextui-org/react';
import { getModels } from '@/apis/adminService';
import { GetModelResult } from '@/types/admin';
import { EditModelModal } from '@/components/Admin/editModelModal';
import { IconPencilCog } from '@tabler/icons-react';

export default function Models() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<GetModelResult | null>(
    null
  );
  const [models, setModels] = useState<GetModelResult[]>([]);
  const [loadingModel, setLoadingModel] = useState(false);
  useEffect(() => {
    setLoadingModel(true);
    init();
  }, []);

  const init = () => {
    getModels().then((data) => {
      setModels(data);
      setIsOpen(false);
      setSelectedModel(null);
      setLoadingModel(false);
    });
  };

  const disEnableModel = (item: GetModelResult, modelId: string) => {};

  const handleShow = (item: GetModelResult) => {
    setIsOpen(true);
    setSelectedModel(item);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedModel(null);
  };

  const columns = [
    { name: 'RANK', uid: 'rank' },
    { name: 'ID', uid: 'modelId' },
    { name: 'NAME', uid: 'name' },
    { name: 'TYPE', uid: 'type' },
    { name: 'ACTIONS', uid: 'actions' },
  ];
  const renderCell = React.useCallback(
    (item: GetModelResult, columnKey: React.Key) => {
      switch (columnKey) {
        case 'rank':
          return <div>{item.rank}</div>;
        case 'modelId':
          return (
            <div className='flex'>
              <Tooltip content={item.enable ? 'Enabled' : 'Disabled'}>
                <Chip
                  className='capitalize border-none gap-1 text-default-600'
                  color={item.enable ? 'success' : 'default'}
                  size='sm'
                  variant='dot'
                ></Chip>
              </Tooltip>
              {item.modelId}
            </div>
          );
        case 'name':
          return <div>{item.name}</div>;
        case 'type':
          return <div>{item.type}</div>;
        case 'actions':
          return (
            <div className='relative flex items-center'>
              <Tooltip content='Edit'>
                <span className='text-lg text-default-400 cursor-pointer active:opacity-50'>
                  <IconPencilCog
                    onClick={() => {
                      handleShow(item);
                    }}
                    className='text-default-400'
                    size={20}
                  />
                </span>
              </Tooltip>
            </div>
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
          items={models}
        >
          {(item) => (
            <TableRow key={item.modelId}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <EditModelModal
        selectedModel={selectedModel}
        isOpen={isOpen}
        onClose={handleClose}
        onSuccessful={init}
      ></EditModelModal>
    </>
  );
}

export const getServerSideProps = async ({ locale }: { locale: string }) => {
  return {
    props: {},
  };
};
