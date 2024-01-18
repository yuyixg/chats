import React from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Tooltip,
  ChipProps,
} from '@nextui-org/react';

const statusColorMap: Record<string, ChipProps['color']> = {
  active: 'success',
  paused: 'danger',
  vacation: 'warning',
};

export default function Models() {
  const renderCell = React.useCallback(
    (user: { name: string }, columnKey: React.Key) => {
      const cellValue = user[columnKey as keyof { name: string }];

      switch (columnKey) {
        case 'name':
          return <div>{user.name}</div>;
        case 'role':
          return (
            <div className='flex flex-col'>
              <p className='text-bold text-sm capitalize'>{cellValue}</p>
              <p className='text-bold text-sm capitalize text-default-400'>
                {user.name}
              </p>
            </div>
          );
        // case 'status':
        //   return (
        //     <Chip
        //       className='capitalize'
        //       color={statusColorMap[user.name]}
        //       size='sm'
        //       variant='flat'
        //     >
        //       {cellValue}
        //     </Chip>
        //   );
        case 'actions':
          return (
            <div className='relative flex items-center gap-2'>
              <Tooltip content='Details'>
                <span className='text-lg text-default-400 cursor-pointer active:opacity-50'>
                  {/* <EyeIcon /> */}
                  Eye
                </span>
              </Tooltip>
              <Tooltip content='Edit user'>
                <span className='text-lg text-default-400 cursor-pointer active:opacity-50'>
                  {/* <EditIcon /> */}
                  Edit
                </span>
              </Tooltip>
              <Tooltip color='danger' content='Delete user'>
                <span className='text-lg text-danger cursor-pointer active:opacity-50'>
                  {/* <DeleteIcon /> */}
                  Delete
                </span>
              </Tooltip>
            </div>
          );
        default:
          return cellValue;
      }
    },
    []
  );
  const columns = [
    { name: 'NAME', uid: 'name' },
    { name: 'ROLE', uid: 'role' },
    { name: 'STATUS', uid: 'status' },
    { name: 'ACTIONS', uid: 'actions' },
  ];
  const items = [{ modelId: 'gpt-4', name: 'GPT-4' }];
  return (
    <Table>
      <TableHeader columns={columns}>
        {(column) => <TableColumn key={column.uid}>{column.name}</TableColumn>}
      </TableHeader>
      <TableBody items={items}>
        {(item) => (
          <TableRow key={item.modelId}>
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export const getServerSideProps = async ({ locale }: { locale: string }) => {
  return {
    props: {},
  };
};
