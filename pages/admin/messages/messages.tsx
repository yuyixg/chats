import React, { useEffect, useState } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { getMessages } from '@/apis/adminService';
import { PageResult, Paging } from '@/types/page';
import { GetUserMessageResult } from '@/types/admin';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function Messages() {
  const { t } = useTranslation('admin');
  const [page, setPage] = useState<Paging>({ page: 1, pageSize: 12 });
  const [messages, setMessages] =
    useState<PageResult<GetUserMessageResult[]>>();
  const [query, setQuery] = useState('');

  useEffect(() => {
    getMessages({ ...page, query }).then((data) => {
      setMessages(data);
    });
  }, []);

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
              <TableHead>{t('Title')}</TableHead>
              <TableHead>{t('User Name')}</TableHead>
              <TableHead>{t('Consume tokens')}</TableHead>
              <TableHead>{t('Chat Counts')}</TableHead>
              <TableHead>{t('Created Time')}</TableHead>
              <TableHead>{t('Updated Time')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages?.rows.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.username}</TableCell>
                <TableCell>{item.tokenCount}</TableCell>
                <TableCell>{item.chatCount}</TableCell>
                <TableCell>
                  {new Date(item.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  {new Date(item.updatedAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}

export const getServerSideProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common', 'admin'])),
    },
  };
};
