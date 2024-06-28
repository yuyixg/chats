import React, { useEffect, useState } from 'react';

import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { GetRequestLogsListResult } from '@/types/admin';
import { PageResult, Paging } from '@/types/page';
import { DEFAULT_LANGUAGE } from '@/types/settings';
import { StatusCodeColor } from '@/types/statusCode';

import PaginationContainer from '@/components/Admin/Pagiation/Pagiation';
import { RequestLogDetailsModal } from '@/components/Admin/RequestLogs/RequestLogDetailsModal';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { getRequestLogs } from '@/apis/adminService';

export default function RequestLogs() {
  const { t } = useTranslation('admin');
  const [loading, setLoading] = useState(true);
  const [logDetail, setLogDetail] = useState<GetRequestLogsListResult | null>(
    null,
  );
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
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex justify-between gap-3 items-center">
          <Input
            className="w-full"
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
              <TableHead>{t('Url')}</TableHead>
              <TableHead>{t('User Name')}</TableHead>
              <TableHead>{t('IP Address')}</TableHead>
              <TableHead>{t('Method')}</TableHead>
              <TableHead>{t('Status Code')}</TableHead>
              <TableHead>{t('Created Time')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody
            emptyText={t('No data')!}
            isLoading={loading}
            isEmpty={requestLogs.count === 0}
          >
            {requestLogs?.rows.map((item) => (
              <TableRow
                key={item.id}
                onClick={() => {
                  setLogDetail(item);
                }}
              >
                <TableCell>{item.url}</TableCell>
                <TableCell
                  onClick={() => {}}
                  className="truncate cursor-pointer"
                >
                  {item.username}
                </TableCell>
                <TableCell>{item.ip}</TableCell>
                <TableCell>{item.method}</TableCell>
                <TableCell>
                  <div
                    style={{ background: StatusCodeColor[item.statusCode] }}
                    className="inline-flex items-center cursor-default rounded-md px-2.5 py-0.5 text-xs text-white"
                  >
                    {item.statusCode}
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(item.createdAt).toLocaleString()}
                </TableCell>
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
      <RequestLogDetailsModal
        isOpen={!!logDetail}
        requestLogId={logDetail?.id}
        onClose={() => {
          setLogDetail(null);
        }}
      />
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
