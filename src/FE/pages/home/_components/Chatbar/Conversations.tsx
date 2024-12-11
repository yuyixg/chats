import { useContext, useEffect, useState } from 'react';

import useTranslation from '@/hooks/useTranslation';

import { ChatResult } from '@/types/clientApis';

import { Button } from '@/components/ui/button';

import HomeContext from '../../_contents/Home.context';
import ConversationComponent from './Conversation';

interface Props {
  chats: ChatResult[];
}

const Conversations = ({ chats }: Props) => {
  const { t } = useTranslation();
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
export default Conversations;
