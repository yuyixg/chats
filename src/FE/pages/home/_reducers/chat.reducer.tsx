import { IChat } from '@/types/chat';
import { ChatResult } from '@/types/clientApis';

export type SetChatsType = ChatResult[];
export type SetSelectedChatType = IChat | undefined;
export type SetChatStatusType = boolean;
export type SetChatPagingType = {
  count: number;
  page: number;
  pageSize: number;
};

export type SetMessageIsStreamingType = boolean;

interface ChatInitialState {
  chats: SetChatsType;
  selectChat?: SetSelectedChatType;
  chatError: SetChatStatusType;
  chatsPaging: SetChatPagingType;
  messageIsStreaming: SetMessageIsStreamingType;
}

export const chatInitialState: ChatInitialState = {
  chats: [],
  selectChat: {} as any,
  chatError: false,
  chatsPaging: { count: 0, page: 1, pageSize: 50 },
  messageIsStreaming: false,
};

export enum ChatActionTypes {
  SET_CHATS = 'SET_CHATS',
  SET_CHATS_INCR = 'SET_CHATS_INCR',
  SET_SELECTED_CHAT = 'SET_SELECTED_CHAT',
  SET_CHAT_STATUS = 'SET_CHAT_STATUS',
  SET_CHAT_PAGING = 'SET_CHAT_PAGING',
  SET_MESSAGE_IS_STREAMING = 'SET_MESSAGE_IS_STREAMING',
}

export type ChatAction =
  | { type: ChatActionTypes.SET_CHATS; payload: SetChatsType }
  | { type: ChatActionTypes.SET_CHATS_INCR; payload: SetChatsType }
  | { type: ChatActionTypes.SET_SELECTED_CHAT; payload: SetSelectedChatType }
  | { type: ChatActionTypes.SET_CHAT_STATUS; payload: SetChatStatusType }
  | { type: ChatActionTypes.SET_CHAT_PAGING; payload: SetChatPagingType }
  | {
      type: ChatActionTypes.SET_MESSAGE_IS_STREAMING;
      payload: SetMessageIsStreamingType;
    };

export default function chatReducer(
  state: ChatInitialState,
  action: ChatAction,
): ChatInitialState {
  switch (action.type) {
    case ChatActionTypes.SET_CHATS:
      return { ...state, chats: action.payload };
    case ChatActionTypes.SET_CHATS_INCR:
      return { ...state, chats: [...state.chats, ...action.payload] };
    case ChatActionTypes.SET_SELECTED_CHAT:
      return { ...state, selectChat: action.payload };
    case ChatActionTypes.SET_CHAT_STATUS:
      return { ...state, chatError: action.payload };
    case ChatActionTypes.SET_CHAT_PAGING:
      return { ...state, chatsPaging: action.payload };
    case ChatActionTypes.SET_MESSAGE_IS_STREAMING:
      return { ...state, messageIsStreaming: action.payload };
    default:
      return state;
  }
}
