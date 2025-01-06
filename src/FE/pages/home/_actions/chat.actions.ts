import { AdminModelDto } from '@/types/adminApis';
import { IChat } from '@/types/chat';
import { ChatSpanDto } from '@/types/clientApis';

import {
  ChatAction,
  ChatActionTypes,
  SetChatPagingType,
  SetChatsType,
  SetIsChatsLoadingType,
  SetSelectedChatType,
  SetStopIdsType,
} from '../_reducers/chat.reducer';

export const setChats = (chats: SetChatsType): ChatAction => ({
  type: ChatActionTypes.SET_CHATS,
  payload: chats,
});

export const setChatGroups = (chats: IChat[]): ChatAction => {
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

    const sortedData = data.sort((a, b) => {
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      return dateB - dateA;
    });

    sortedData.forEach((item) => {
      const date = new Date(item.updatedAt);

      let groupKey: string;

      if (isSameDay(date, now)) {
        groupKey = 'Today';
      } else if (
        isSameDay(
          date,
          new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
        )
      ) {
        groupKey = 'Yesterday';
      } else if (isWithinDays(date, 7)) {
        groupKey = 'Last 7 days';
      } else if (isWithinDays(date, 30)) {
        groupKey = 'Last 30 days';
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

  const chatGroups = chatsGroupByUpdatedAt(chats);

  return {
    type: ChatActionTypes.SET_CHAT_GROUPS,
    payload: chatGroups,
  };
};

export const setSelectedChat = (chat?: SetSelectedChatType): ChatAction => {
  return {
    type: ChatActionTypes.SET_SELECTED_CHAT,
    payload: chat,
  };
};

export const setChangeSelectedChatSpan = (
  chat: IChat,
  span: ChatSpanDto,
  model: AdminModelDto,
): ChatAction => {
  chat.spans = chat.spans.map((s) => {
    if (s.spanId === span.spanId) {
      s = {
        ...s,
        ...span,
        modelId: model.modelId,
        modelName: model.name,
        modelProviderId: model.modelProviderId,
      };
    }
    return s;
  });
  return {
    type: ChatActionTypes.SET_SELECTED_CHAT,
    payload: chat,
  };
};

export const setChatPaging = (paging: SetChatPagingType): ChatAction => ({
  type: ChatActionTypes.SET_CHAT_PAGING,
  payload: paging,
});

export const setIsChatsLoading = (
  isChatsLoading: SetIsChatsLoadingType,
): ChatAction => ({
  type: ChatActionTypes.SET_IS_CHATS_LOADING,
  payload: isChatsLoading,
});

export const setStopIds = (stopIds: SetStopIdsType): ChatAction => ({
  type: ChatActionTypes.SET_STOP_IDS,
  payload: stopIds,
});

export default function () {}
