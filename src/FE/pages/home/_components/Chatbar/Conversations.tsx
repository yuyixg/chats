import { useContext, useEffect, useState } from 'react';

import useTranslation from '@/hooks/useTranslation';

import { IChat } from '@/types/chat';

import { Button } from '@/components/ui/button';

import HomeContext from '../../_contexts/home.context';
import ConversationComponent from './Conversation';

interface Props {
  groupId: string | null;
  chatGroups: Map<string, IChat[]>;
  onShowMore?: (groupId: string | null) => void;
}

const Conversations = ({ groupId, chatGroups, onShowMore }: Props) => {
  const { t } = useTranslation();
  const {
    state: { chatPaging },
    getChatsByGroup,
  } = useContext(HomeContext);

  const [showMore, setShowMore] = useState(true);

  useEffect(() => {
    const { count, page, pageSize } = chatPaging.find(
      (x) => x.groupId === groupId,
    )!;
    setShowMore(count <= page * pageSize);
  }, [chatPaging]);

  const handleShowMore = () => {
    onShowMore && onShowMore(groupId);
  };

  return (
    <div className="flex w-full flex-col gap-1">
      {chatGroups.size > 0 &&
        [...chatGroups.entries()].map(([group, items]) => (
          <div key={group}>
            <div className="w-full pl-2.5 text-xs text-gray-500 font-medium my-1">
              {t(group)}
            </div>
            {items.map((chat, index) => (
              <ConversationComponent key={index} chat={chat} />
            ))}
          </div>
        ))}
      {!showMore && (
        <Button onClick={handleShowMore} className="text-xs" variant="link">
          {t('Show more')}
        </Button>
      )}
    </div>
  );
};
export default Conversations;
