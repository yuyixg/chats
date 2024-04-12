import React, { useEffect, useState } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { getRequestLogs } from '@/apis/adminService';
import { PageResult, Paging } from '@/types/page';
import { GetRequestLogsListResult } from '@/types/admin';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import PaginationContainer from '@/components/Admin/Pagiation/Pagiation';
import { DEFAULT_LANGUAGE } from '@/types/settings';
import { Badge } from '@/components/ui/badge';

export default function RequestLogs() {
  const { t } = useTranslation('admin');
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Paging>({
    page: 1,
    pageSize: 12,
  });
  const [requestLogs, setRequestLogs] = useState<
    PageResult<GetRequestLogsListResult[]>
  >({
    count: 0,
    rows: [],
  });
  const [query, setQuery] = useState('');

  useEffect(() => {
    getRequestLogs({ ...pagination, query }).then((data) => {
      setRequestLogs(data);
      setLoading(false);
    });
  }, [pagination, query]);

  return (
    <>
      <div className='flex flex-col gap-4 mb-4'>
        <div className='flex justify-between gap-3 items-center'>
          <Input
            className='w-full'
            placeholder={t('Search...')!}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
          />
        </div>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('User Name')}</TableHead>
              <TableHead>{t('Url')}</TableHead>
              <TableHead>{t('Method')}</TableHead>
              <TableHead>{t('Status Code')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody isLoading={loading} isEmpty={requestLogs.count === 0}>
            {requestLogs?.rows.map((item) => (
              <TableRow key={item.id}>
                <TableCell
                  onClick={() => {}}
                  className='truncate cursor-pointer'
                >
                  {item.username}
                </TableCell>
                <TableCell>{item.url}</TableCell>
                <TableCell>{item.method}</TableCell>
                <TableCell>{item.statusCode}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {requestLogs.count !== 0 && (
          <PaginationContainer
            page={pagination.page}
            pageSize={pagination.pageSize}
            currentCount={requestLogs.rows.length}
            totalCount={requestLogs.count}
            onPagingChange={(page, pageSize) => {
              setPagination({ page, pageSize });
            }}
          />
        )}
      </Card>
    </>
  );
}

export const getServerSideProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? DEFAULT_LANGUAGE, [
        'common',
        'admin',
        'pagination',
      ])),
    },
  };
};
