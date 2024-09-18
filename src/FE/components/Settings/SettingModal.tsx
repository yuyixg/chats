import React, { useEffect } from 'react';

import { useTranslation } from 'next-i18next';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { ApiKeyTab } from './ApiKeyTabContent';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingModal = (props: Props) => {
  const { isOpen, onClose } = props;
  const { t } = useTranslation('sidebar');

  useEffect(() => {}, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-5xl gap-0 overflow-scroll max-h-full">
        <DialogHeader className="mb-[16px]">
          <DialogTitle>{t('Settings')}</DialogTitle>
        </DialogHeader>
        <ApiKeyTab />
      </DialogContent>
    </Dialog>
  );
};
