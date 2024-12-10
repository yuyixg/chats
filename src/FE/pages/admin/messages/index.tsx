import React, { useEffect, useState } from 'react';

import useTranslation from '@/hooks/useTranslation';

import { DEFAULT_LANGUAGE } from '@/utils/settings';

import { GetUserMessageResult } from '@/types/adminApis';
import { PageResult, Paging } from '@/types/page';

import PaginationContainer from '@/pages/admin/_components/Pagiation/Pagiation';
import { Badge } from '@/components/ui/badge';
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

import { getMessages } from '@/apis/adminApis';

export default function Messages() {
  const { t } = useTranslation();
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
              <TableHead>{t('Title')}</TableHead>
              <TableHead>{t('Model Display Name')}</TableHead>
              <TableHead>{t('User Name')}</TableHead>
              <TableHead>{t('Created Time')}</TableHead>
              <TableHead>{t('Status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody isLoading={loading} isEmpty={messages.count === 0}>
            {messages?.rows.map((item) => (
              <TableRow key={item.id}>
                <TableCell
                  onClick={() => {
                    window.open('/message/' + item.id, '_blank');
                  }}
                  className="truncate cursor-pointer"
                >
                  {item.title}
                </TableCell>
                <TableCell>{item.modelName}</TableCell>
                <TableCell>{item.username}</TableCell>
                <TableCell>
                  {new Date(item.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  {item.isDeleted && (
                    <Badge variant="destructive">{t('Deleted')}</Badge>
                  )}
                  {item.isShared && (
                    <Badge className=" bg-green-600">{t('Shared')}</Badge>
                  )}
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
