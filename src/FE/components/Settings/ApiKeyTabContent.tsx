import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import Link from 'next/link';

import useTranslation from '@/hooks/useTranslation';

import { getApiUrl } from '@/utils/common';

import { GetUserApiKeyResult } from '@/types/clientApis';

import CopyButton from '@/components/Button/CopyButton';
import DateTimePopover from '@/components/Popover/DateTimePopover';
import DeletePopover from '@/components/Popover/DeletePopover';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  deleteUserApiKey,
  getUserApiKey,
  postUserApiKey,
  putUserApiKey,
} from '@/apis/clientApis';

let timer: NodeJS.Timeout;
export const ApiKeyTab = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [apiKeys, setApiKeys] = useState<GetUserApiKeyResult[]>([]);
  type GetUserApiKeyType = keyof GetUserApiKeyResult;

  const initData = () => {
    getUserApiKey()
      .then((data) => {
        setApiKeys(data);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    setLoading(true);
    initData();
  }, []);

  const createApiKey = () => {
    postUserApiKey().then(() => {
      initData();
    });
  };

  const changeApiKeyBy = <K extends GetUserApiKeyType>(
    index: number,
    type: K,
    value: GetUserApiKeyResult[K],
  ) => {
    const apiKey = apiKeys[index];
    setApiKeys((prev) => {
      const data = [...prev];
      data[index][type] = value;
      return data;
    });
    clearTimeout(timer);
    timer = setTimeout(() => {
      putUserApiKey(apiKey.id, { [type]: value })
        .then(() => {
          toast.success(t('Save successful'));
        })
        .catch(() => {
          toast.error(
            t(
              'Operation failed, Please try again later, or contact technical personnel',
            ),
          );
        });
    }, 1000);
  };

  const removeApiKey = (id: number) => {
    deleteUserApiKey(id)
      .then(() => {
        setApiKeys((prev) =>
          prev.filter((x) => {
            return x.id !== id;
          }),
        );
        toast.success(t('Delete successful'));
      })
      .catch(() => {
        toast.error(
          t(
            'Operation failed, Please try again later, or contact technical personnel',
          ),
        );
      });
  };

  const apiUrl = (getApiUrl() || location.origin) + '/v1';
  const docUrl = 'https://platform.openai.com/docs/guides/chat-completions';
  return (
    <div className="w-full overflow-auto">
      <div className="flex justify-end">
        <Button variant="default" onClick={createApiKey}>
          {t('Create')}
        </Button>
      </div>
      <Card className="mt-2 bg-muted">
        <CardContent className="p-4">
          <div className="flex text-sm items-center overflow-hidden text-ellipsis whitespace-nowrap">
            API URL: {apiUrl}
            <CopyButton value={apiUrl} />
          </div>
          <div className="flex text-sm items-center overflow-hidden text-ellipsis whitespace-nowrap">
            {t('API documentation URL')}:&nbsp;
            <Link
              target="_blank"
              className="text-blue-600 dark:text-blue-500 hover:underline"
              href={docUrl}
            >
              {docUrl}
            </Link>
            <CopyButton value={docUrl} />
          </div>
        </CardContent>
      </Card>
      <Card className="mt-2">
        <Table>
          <TableHeader>
            <TableRow className="pointer-events-none">
              <TableHead>{t('Key')}</TableHead>
              <TableHead>{t('Comment')}</TableHead>
              <TableHead className="text-center">{t('Expires')}</TableHead>
              <TableHead>{t('LastUsedAt')}</TableHead>
              <TableHead>{t('Actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody isEmpty={apiKeys.length === 0} isLoading={loading}>
            {apiKeys.map((x, index) => {
              return (
                <TableRow key={x.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {x.key}
                      </div>
                      <CopyButton value={x.key} />
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[128px] max-w-[128px]">
                    <Input
                      className="border-none"
                      value={x.comment}
                      onChange={(e) => {
                        changeApiKeyBy(index, 'comment', e.target.value);
                      }}
                    />
                  </TableCell>
                  <TableCell className="min-w-[128px] max-w-[128px]">
                    <DateTimePopover
                      value={x.expires}
                      onSelect={(date: Date) => {
                        changeApiKeyBy(index, 'expires', date as any);
                      }}
                    />
                  </TableCell>
                  <TableCell className="min-w-[128px] max-w-[128px]">
                    {x.lastUsedAt
                      ? new Date(x.lastUsedAt).toLocaleDateString()
                      : '-'}
                  </TableCell>
                  <TableCell className="max-w-[64px]">
                    <DeletePopover
                      onDelete={() => {
                        removeApiKey(x.id);
                      }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
