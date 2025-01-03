import { useContext, useEffect, useState } from 'react';

import useTranslation from '@/hooks/useTranslation';

import { IChat } from '@/types/chat';

import { Button } from '@/components/ui/button';

import HomeContext from '../../_contexts/home.context';
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

  const chatsGroupByUpdatedAt = (data: IChat[]): Map<string, IChat[]> => {
    const groupedData = new Map<string, IChat[]>();
    const now = new Date();

    const isSameDay = (date1: Date, date2: Date): boolean => {
      return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
      );
    };

    const isWithinDays = (date: Date, days: number): boolean => {
      const pastDate = new Date(now);
      pastDate.setDate(now.getDate() - days);
      return date >= pastDate && date <= now;
    };

    data.forEach((item) => {
      const date = new Date(item.updatedAt);

      let groupKey: string;

      if (isSameDay(date, now)) {
        groupKey = t('Today');
      } else if (
        isSameDay(
          date,
          new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
        )
      ) {
        groupKey = t('Yesterday');
      } else if (isWithinDays(date, 7)) {
        groupKey = t('Last 7 days');
      } else if (isWithinDays(date, 30)) {
        groupKey = t('Last 30 days');
      } else {
        groupKey = `${date.getFullYear()}`;
      }

      if (!groupedData.has(groupKey)) {
        groupedData.set(groupKey, []);
      }

      groupedData.get(groupKey)!.push(item);
    });

    return groupedData;
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
