import React, { useState } from 'react';
import toast from 'react-hot-toast';

import useTranslation from '@/hooks/useTranslation';

import { ChatResult } from '@/types/clientApis';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import { putChats } from '@/apis/clientApis';

interface IProps {
  chat: ChatResult;
  isOpen: boolean;
  onClose: () => void;
  onShareChange: (isShared: boolean) => void;
}

export const SharedMessageModal = (props: IProps) => {
  const { t } = useTranslation();
  const { chat, isOpen, onClose, onShareChange } = props;
  const [loading, setLoading] = useState(false);
  const shareUrl = `${location.origin}/share/${chat.id}`;

  const handleSharedMessage = () => {
    setLoading(true);
    putChats(chat.id, { isShared: true })
      .then(() => {
        onShareChange(true);
        handleCopySharedUrl();
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCloseShared = () => {
    setLoading(true);
    putChats(chat.id, { isShared: false })
      .then(() => {
        onShareChange(false);
        toast.success(t('Save successful'));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCopySharedUrl = () => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success(t('Copy Successful'));
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[320px]">
        <DialogHeader>
          <DialogTitle>{t('Share Message')}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Input value={shareUrl}></Input>
          {chat?.isShared ? (
            <>
              <Button
                variant="link"
                onClick={() => {
                  handleCloseShared();
                }}
                disabled={loading}
              >
                {t('Close Shared')}
              </Button>
              <Button
                onClick={() => {
                  handleCopySharedUrl();
                }}
                disabled={loading}
              >
                {t('Copy Link')}
              </Button>
            </>
          ) : (
            <Button
              disabled={loading}
              onClick={() => {
                handleSharedMessage();
              }}
            >
              {t('Share and Copy Link')}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
