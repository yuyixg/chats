import { useContext, useEffect, useState } from 'react';

import useTranslation from '@/hooks/useTranslation';

import { IChat } from '@/types/chat';

import { Button } from '@/components/ui/button';

import HomeContext from '../../_contexts/home.context';
import { chatsGroupByUpdatedAt } from './Chatbar.utils';
import ConversationComponent from './Conversation';

interface Props {
  chats: IChat[];
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
    getChats({ page: page + 1, pageSize: pageSize }, true);
  };

  return (
    <div className="flex w-full flex-col gap-1">
      {[...chatsGroupByUpdatedAt(chats.slice()).entries()].map(
        ([group, items]) => (
          <div key={group}>
            <div className="w-full pl-2.5 text-xs text-gray-500 font-medium my-1">
              {group}
            </div>
            {items.map((chat, index) => (
              <ConversationComponent key={index} chat={chat} />
            ))}
          </div>
        ),
      )}
      {!showMore && (
        <Button onClick={handleShowMore} className="text-xs" variant="link">
          {t('Show more')}
        </Button>
      )}
    </div>
  );
};
export default Conversations;
