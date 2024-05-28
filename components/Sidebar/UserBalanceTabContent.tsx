import { getUserBalance } from '@/apis/userService';
import { GetUserBalanceLogsResult, GetUserBalanceResult } from '@/types/user';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Separator } from '../ui/separator';

const UserBalanceTabContent = () => {
  const { t } = useTranslation('sidebar');
  const [balanceData, setBalanceData] = useState<GetUserBalanceResult>();

  useEffect(() => {
    getUserBalance().then((data) => {
      const logs: GetUserBalanceLogsResult[] = [];
      data.logs.forEach((x) => {
        const date = new Date(x.date).toLocaleDateString();
        const log = logs.find((x) => x.date === date);
        if (log) {
          log.value += +x.value;
        } else {
          logs.push({ date, value: +x.value });
        }
      });
      setBalanceData({ balance: data.balance, logs });
    });
  }, []);
  return (
    <>
      <div className='flex gap-2 items-center'>
        <span>{t('Balance')}</span>
        {(+(balanceData?.balance || 0)).toFixed(2)} {t('Yuan')}
      </div>
      <Separator className='my-2' />
      <div className='flex flex-col gap-2'>
        <span className='text-sm'>{t('Recent 7 day consumption records')}</span>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='h-8 py-2'>{t('Date')}</TableHead>
              <TableHead className='h-8 py-2'>{t('Amount')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {balanceData?.logs.map((log) => (
              <TableRow key={log.date}>
                <TableCell className='h-8 py-2'>{log.date}</TableCell>
                <TableCell className='h-8 py-2'>
                  {(+(log?.value || 0)).toFixed(2)}
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
