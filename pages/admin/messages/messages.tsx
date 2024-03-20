import React, { useEffect, useState } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { getMessages } from '@/apis/adminService';
import { PageResult, Paging } from '@/types/page';
import { GetUserMessageResult } from '@/types/admin';
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
import PaginationContainer from '@/components/Admin/Pagiation';

export default function Messages() {
  const { t } = useTranslation('admin');
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Paging>({
    page: 1,
    pageSize: 12,
  });
  const [messages, setMessages] = useState<PageResult<GetUserMessageResult[]>>({
    count: 0,
    rows: [],
  });
  const [query, setQuery] = useState('');

  useEffect(() => {
    getMessages({ ...pagination, query }).then((data) => {
      setMessages(data);
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
              <TableHead>{t('Model Display Name')}</TableHead>
              <TableHead>{t('Title')}</TableHead>
              <TableHead>{t('User Name')}</TableHead>
              <TableHead>{t('Consume tokens')}</TableHead>
              <TableHead>{t('Chat Counts')}</TableHead>
              <TableHead>{t('Updated Time')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody isLoading={loading}>
            {messages?.rows.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.modelName}</TableCell>
                <TableCell className='truncate'>{item.name}</TableCell>
                <TableCell>{item.username}</TableCell>
                <TableCell>{item.tokenCount}</TableCell>
                <TableCell>{item.chatCount}</TableCell>
                <TableCell>
                  {new Date(item.updatedAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {messages.count !== 0 && (
          <PaginationContainer
            page={pagination.page}
            pageSize={pagination.pageSize}
            currentCount={messages.rows.length}
            totalCount={messages.count}
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
      ...(await serverSideTranslations(locale ?? 'en', [
        'common',
        'admin',
        'pagination',
      ])),
    },
  };
};
