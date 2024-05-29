import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader } from '../ui/dialog';
import { Button } from '../ui/button';
import { ChatResult, putChats } from '@/apis/userService';
import toast from 'react-hot-toast';
import { Input } from '../ui/input';

interface IProps {
  chat: ChatResult;
  isOpen: boolean;
  onClose: () => void;
  onShareChange: (isShared: boolean) => void;
}

export const SharedMessageModal = (props: IProps) => {
  const { t } = useTranslation('chat');
  const { chat, isOpen, onClose, onShareChange } = props;
  const [loading, setLoading] = useState(false);
  const shareUrl = `${location.origin}/share/${chat.id}`;

  const handleSharedMessage = () => {
    setLoading(true);
    putChats({ id: chat.id, isShared: true })
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
    putChats({ id: chat.id, isShared: false })
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
      <DialogContent className='max-w-[320px]'>
        <DialogHeader>{t('Share Message')}</DialogHeader>

        <div className='flex flex-col gap-2'>
          <Input value={shareUrl}></Input>
          {chat?.isShared ? (
            <>
              <Button
                variant='link'
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
