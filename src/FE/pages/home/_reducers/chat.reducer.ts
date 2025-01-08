import { IChat } from '@/types/chat';
import { IChatGroup } from '@/types/group';

export type SetChatsType = IChat[];
export type SetSelectedChatType = IChat | undefined;
export type SetChatStatusType = boolean;
export type SetChatPagingType = {
  count: number;
  page: number;
  pageSize: number;
};
export type SetIsChatsLoadingType = boolean;
export type SetStopIdsType = string[];
export type SetChatGroupType = IChatGroup[];

interface ChatInitialState {
  chats: SetChatsType;
  selectedChat?: SetSelectedChatType;
  chatsPaging: SetChatPagingType;
  isChatsLoading: SetIsChatsLoadingType;
  stopIds: SetStopIdsType;
  chatGroups: SetChatGroupType;
}

export const chatInitialState: ChatInitialState = {
  chats: [],
  selectedChat: undefined,
  chatsPaging: { count: 0, page: 1, pageSize: 50 },
  isChatsLoading: false,
  stopIds: [],
  chatGroups: [],
};

export enum ChatActionTypes {
  SET_CHATS = 'SET_CHATS',
  SET_CHAT_GROUPS = 'SET_CHAT_GROUPS',
  SET_CHATS_INCR = 'SET_CHATS_INCR',
  SET_SELECTED_CHAT = 'SET_SELECTED_CHAT',
  SET_CHAT_PAGING = 'SET_CHAT_PAGING',
  SET_IS_CHATS_LOADING = 'SET_IS_CHATS_LOADING',
  SET_STOP_IDS = 'SET_STOP_IDS',
  SET_CHAT_GROUP = 'SET_CHAT_GROUP',
}

export type ChatAction =
  | { type: ChatActionTypes.SET_CHATS; payload: SetChatsType }
  | { type: ChatActionTypes.SET_CHATS_INCR; payload: SetChatsType }
  | { type: ChatActionTypes.SET_SELECTED_CHAT; payload: SetSelectedChatType }
  | { type: ChatActionTypes.SET_CHAT_PAGING; payload: SetChatPagingType }
  | {
      type: ChatActionTypes.SET_IS_CHATS_LOADING;
      payload: SetIsChatsLoadingType;
    }
  | { type: ChatActionTypes.SET_STOP_IDS; payload: SetStopIdsType }
  | { type: ChatActionTypes.SET_CHAT_GROUP; payload: SetChatGroupType };

export default function chatReducer(
  state: ChatInitialState,
  action: ChatAction,
): ChatInitialState {
  switch (action.type) {
    case ChatActionTypes.SET_CHATS:
      return { ...state, chats: action.payload };
    case ChatActionTypes.SET_SELECTED_CHAT:
      return { ...state, selectedChat: action.payload };
    case ChatActionTypes.SET_CHAT_PAGING:
      return { ...state, chatsPaging: action.payload };
    case ChatActionTypes.SET_IS_CHATS_LOADING:
      return { ...state, isChatsLoading: action.payload };
    case ChatActionTypes.SET_STOP_IDS:
      return { ...state, stopIds: action.payload };
    case ChatActionTypes.SET_CHAT_GROUP:
      return { ...state, chatGroups: action.payload };
    default:
      return state;
  }
}
