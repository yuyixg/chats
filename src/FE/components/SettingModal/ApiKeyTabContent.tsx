import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { useTranslation } from 'next-i18next';
import Link from 'next/link';

import { getApiUrl } from '@/utils/common';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import DateTimePopover from '../Popover/DateTimePopover';
import DeletePopover from '../Popover/DeletePopover';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

import {
  GetUserApiKeyResult,
  deleteUserApiKey,
  getUserApiKey,
  postUserApiKey,
  putUserApiKey,
} from '@/apis/userService';

export const ApiKeyTab = () => {
  const { t } = useTranslation('sidebar');
  const [loading, setLoading] = useState(false);
  const [apiKeys, setApiKeys] = useState<GetUserApiKeyResult[]>([]);

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

  const changeApiKeyBy = (
    index: number,
    type: 'expires' | 'comment',
    value: any,
  ) => {
    const apiKey = apiKeys[index];
    putUserApiKey(apiKey.id, { [type]: value })
      .then(() => {
        setApiKeys((prev) => {
          const data = [...prev];
          data[index][type] = value;
          return data;
        });
        toast.success(t('Save successful!'));
      })
      .catch(() => {
        toast.error(
          t(
            'Operation failed! Please try again later, or contact technical personnel.',
          ),
        );
      });
  };

  const removeApiKey = (id: number) => {
    deleteUserApiKey(id)
      .then(() => {
        setApiKeys((prev) =>
          prev.filter((x) => {
            return x.id !== id;
          }),
        );
        toast.success(t('Delete successful!'));
      })
      .catch(() => {
        toast.error(
          t(
            'Operation failed! Please try again later, or contact technical personnel.',
          ),
        );
      });
  };

  return (
    <div className="w-full overflow-auto">
      <div className="flex justify-end">
        <Button variant="default" onClick={createApiKey}>
          {t('Create')}
        </Button>
      </div>
      <div className="mb-2">
        <div className="flex text-sm items-center">
          API Url：
          <Link target="_blank" href={getApiUrl() + '/api/openai-compatible'}>
            {getApiUrl() + '/api/openai-compatible'}
          </Link>
        </div>
        <div className="flex text-sm items-center">
          参考文档：
          <Link
            target="_blank"
            className="text-blue-600 dark:text-blue-500 hover:underline"
            href="https://platform.openai.com/docs/guides/chat-completions"
          >
            https://platform.openai.com/docs/guides/chat-completions
          </Link>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="pointer-events-none">
            <TableHead>{t('Key')}</TableHead>
            <TableHead>{t('Comment')}</TableHead>
            <TableHead>{t('Expires')}</TableHead>
            <TableHead>{t('LastUsedAt')}</TableHead>
            <TableHead>{t('Actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody isEmpty={apiKeys.length === 0} isLoading={loading}>
          {apiKeys.map((x, index) => {
            return (
              <TableRow>
                <TableCell className="min-w-[128px] max-w-[128px] overflow-hidden text-ellipsis">
                  {x.key}
                </TableCell>
                <TableCell className="min-w-[128px] max-w-[128px]">
                  <Input
                    value={x.comment}
                    onChange={(e) => {
                      changeApiKeyBy(index, 'comment', e.target.value);
                    }}
                  />
                </TableCell>
                <TableCell className="min-w-[172px] max-w-[172px]">
                  <DateTimePopover
                    value={x.expires}
                    onSelect={(date: Date) => {
                      changeApiKeyBy(index, 'expires', date);
                    }}
                  />
                </TableCell>
                <TableCell className="min-w-[128px] max-w-[128px]">
                  {x.lastUsedAt
                    ? new Date(x.lastUsedAt).toLocaleDateString()
                    : '-'}
                </TableCell>
                <TableCell className="max-w-[32px]">
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
    </div>
  );
};
