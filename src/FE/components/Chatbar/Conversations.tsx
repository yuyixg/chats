import { useContext, useEffect, useState } from 'react';

import { useTranslation } from 'next-i18next';

import { HomeContext } from '@/pages/home/home';

import { Button } from '@/components/ui/button';

import { ConversationComponent } from './Conversation';

import { ChatResult } from '@/apis/clientApis';

interface Props {
  chats: ChatResult[];
}

export const Conversations = ({ chats }: Props) => {
  const { t } = useTranslation('chat');
  const {
    state: { chatsPaging },
    getChats,
  } = useContext(HomeContext);

  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const { count, page, pageSize } = chatsPaging;
    setShowMore(count <= page * pageSize);
  }, [chatsPaging]);

  const handleShowMore = () => {
    const { page, pageSize } = chatsPaging;
    getChats({ page: page + 1, pageSize: pageSize });
  };

  return (
    <div className="flex w-full flex-col gap-1">
      {chats.slice().map((chat, index) => (
        <ConversationComponent key={index} chat={chat} />
      ))}
      {!showMore && (
        <Button onClick={handleShowMore} className="text-[12px]" variant="link">
          {t('Show more')}
        </Button>
      )}
    </div>
  );
};
