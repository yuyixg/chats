import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { DEFAULT_LANGUAGE } from '@/types/settings';
import { GetInvitationCodeResult } from '@/types/user';

import { InvitationCodeModal } from '@/components/Admin/InvitationCode/InvitationCodeModal';
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

import { deleteInvitationCode, getInvitationCode } from '@/apis/adminService';

export default function InvitationCode() {
  const { t } = useTranslation('admin');
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<GetInvitationCodeResult | null>(
    null,
  );
  const [codes, setCodes] = useState<GetInvitationCodeResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    init();
  }, []);

  const init = () => {
    getInvitationCode().then((data) => {
      setCodes(data);
      setIsOpen(false);
      setLoading(false);
    });
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleShow = (item: GetInvitationCodeResult) => {
    setSelected(item);
    setIsOpen(true);
  };

  const onDelete = (id: string) => {
    deleteInvitationCode(id)
      .then(() => {
        toast.success(t('Delete successful!'));
        init();
      })
      .catch(() => {
        toast.error(
          t(
            'Operation failed! Please try again later, or contact technical personnel.',
          ),
        );
      })
      .finally(() => {
        setDeleting(false);
      });
  };

  return (
    <>
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex justify-end gap-3 items-center">
          <Button
            onClick={() => {
              setIsOpen(true);
            }}
            color="primary"
          >
            {t('Add Invitation Code')}
          </Button>
        </div>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('Invitation Code')}</TableHead>
              <TableHead>{t('Use count')}</TableHead>
              <TableHead>{t('Created User')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody
            emptyText={t('No data')!}
            isLoading={loading}
            isEmpty={codes.length === 0}
          >
            {codes.map((item) => (
              <TableRow
                className="cursor-pointer"
                key={item.id}
                onClick={(e) => {
                  handleShow(item);
                  e.stopPropagation();
                }}
              >
                <TableCell>{item.value}</TableCell>
                <TableCell>{item.count}</TableCell>
                <TableCell>{item.username}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <InvitationCodeModal
        selected={selected}
        isOpen={isOpen}
        onClose={handleClose}
        onSuccessful={init}
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
      ])),
    },
  };
};
