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

export default function Users() {
  const renderCell = React.useCallback(
    (user: { name: string }, columnKey: React.Key) => {
      const cellValue = user[columnKey as keyof { name: string }];

      switch (columnKey) {
        case 'name':
          return <div>{user.name}</div>;
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
