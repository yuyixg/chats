import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { ChatMessage } from '../Admin/Messages/ChatMessage';
import { Conversation } from '@/types/chat';
import { ScrollArea } from '../ui/scroll-area';
import { putUserMessages } from '@/apis/userService';
import toast from 'react-hot-toast';

interface IProps {
  conversation?: Conversation;
  isOpen: boolean;
  onClose: () => void;
  onShareChange: (isShare: boolean) => void;
}

export const SharedMessageModal = (props: IProps) => {
  const { t } = useTranslation('chat');
  const { conversation, isOpen, onClose, onShareChange } = props;
  const [loading, setLoading] = useState(false);

  const handleSharedMessage = () => {
    setLoading(true);
    const { id, name } = conversation!;
    putUserMessages(id, name, true)
      .then(() => {
        onShareChange(true);
        handleCopySharedUrl();
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCloseShared = () => {
    const { id, name } = conversation!;
    setLoading(true);
    putUserMessages(id, name, false)
      .then(() => {
        toast.success(t('Save Successful'));
        onShareChange(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCopySharedUrl = () => {
    const { id } = conversation!;
    if (!navigator.clipboard) return;
    navigator.clipboard
      .writeText(`${location.origin}/message/${id}`)
      .then(() => {
        toast.success(t('Copy Successful'));
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='dark:bg-[#202123] w-3/5 h-3/5'>
        <DialogHeader>{t('Share Message')}</DialogHeader>
        <ScrollArea className='h-96 w-full rounded-md border'>
          {conversation?.messages &&
            conversation.messages.map((m, index) => (
              <ChatMessage
                canOperate={false}
                key={'message' + index}
                message={m}
              />
            ))}
        </ScrollArea>
        <DialogFooter className='pt-4'>
          {conversation?.isShared ? (
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
