import { IChat } from '@/types/chat';
import { ChatResult } from '@/types/clientApis';

type SetChatsType = ChatResult[];
type SetSelectChatType = IChat | null;
type SetChatErrorType = boolean;
type SetChatPagingType = { count: number; page: number; pageSize: number };

interface ChatInitialState {
  chats: SetChatsType;
  selectChat: SetSelectChatType;
  chatError: SetChatErrorType;
  chatsPaging: SetChatPagingType;
}

export const chatInitialState: ChatInitialState = {
  chats: [],
  selectChat: null,
  chatError: false,
  chatsPaging: { count: 0, page: 1, pageSize: 50 },
};

export enum ChatActionTypes {
  SET_CHATS = 'SET_CHATS',
  SET_SELECT_CHAT = 'SET_SELECT_CHAT',
  SET_CHAT_ERROR = 'SET_CHAT_ERROR',
  SET_CHAT_PAGING = 'SET_CHAT_PAGING',
}

type ChatAction =
  | { type: ChatActionTypes.SET_CHATS; payload: SetChatsType }
  | { type: ChatActionTypes.SET_SELECT_CHAT; payload: SetSelectChatType }
  | { type: ChatActionTypes.SET_CHAT_ERROR; payload: SetChatErrorType }
  | { type: ChatActionTypes.SET_CHAT_PAGING; payload: SetChatPagingType };

export default function chatReducer(
  state: ChatInitialState,
  action: ChatAction,
): ChatInitialState {
  switch (action.type) {
    case ChatActionTypes.SET_CHATS:
      return { ...state, chats: action.payload };
    case ChatActionTypes.SET_SELECT_CHAT:
      return { ...state, selectChat: action.payload };
    case ChatActionTypes.SET_CHAT_ERROR:
      return { ...state, chatError: action.payload };
    case ChatActionTypes.SET_CHAT_PAGING:
      return { ...state, chatsPaging: action.payload };
    default:
      return state;
  }
}
