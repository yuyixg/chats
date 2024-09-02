import { useEffect, useState } from 'react';

import { useTranslation } from 'next-i18next';

import { Separator } from '../ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

import {
  GetBalance7DaysUsageResult,
  getBalance7DaysUsage,
  getUserBalanceOnly,
} from '@/apis/userService';

const UserBalanceTabContent = () => {
  const { t } = useTranslation('sidebar');
  const [balanceLogs, setBalanceLogs] = useState<GetBalance7DaysUsageResult>({});
  const [totalBalance, setTotalBalance] = useState(0);

  useEffect(() => {
    getBalance7DaysUsage().then((data) => {
      setBalanceLogs(data);
    });
    getUserBalanceOnly().then((data) => {
      setTotalBalance(data);
    });
  }, []);
  return (
    <>
      <div className="flex gap-2 items-center">
        <span>{t('Balance')}</span>
        {(+(totalBalance || 0)).toFixed(2)} {t('Yuan')}
      </div>
      <Separator className="my-2" />
      <div className="flex flex-col gap-2">
        <span className="text-sm">{t('Recent 7 day consumption records')}</span>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="h-8 py-2">{t('Date')}</TableHead>
              <TableHead className="h-8 py-2">{t('Amount')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.keys(balanceLogs).map((date) => (
              <TableRow key={date}>
                <TableCell className="h-8 py-2">{new Date(date).toLocaleDateString()}</TableCell>
                <TableCell className="h-8 py-2">
                  {(+(balanceLogs[date] || 0)).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default UserBalanceTabContent;
