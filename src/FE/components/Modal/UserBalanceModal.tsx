import { useEffect, useState } from 'react';

import { useTranslation } from 'next-i18next';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  GetBalance7DaysUsageResult,
  getBalance7DaysUsage,
} from '@/apis/clientApis';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const UserBalanceModal = (props: Props) => {
  const { isOpen, onClose } = props;

  const { t } = useTranslation('sidebar');
  const [balanceLogs, setBalanceLogs] = useState<GetBalance7DaysUsageResult[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getBalance7DaysUsage().then((data) => {
      setBalanceLogs(data);
      setLoading(false);
    });
  }, []);
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full w- max-w-2xl">
        <DialogHeader className="mb-[16px]">
          <DialogTitle>{t('Recent 7 day consumption records')}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="h-8 py-2">{t('Date')}</TableHead>
                <TableHead className="h-8 py-2">{t('Amount')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody isLoading={loading}>
              {balanceLogs.map((x) => (
                <TableRow key={x.date}>
                  <TableCell className="h-8 py-2">
                    {new Date(x.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="h-8 py-2">
                    {(+(x.costAmount || 0)).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserBalanceModal;
