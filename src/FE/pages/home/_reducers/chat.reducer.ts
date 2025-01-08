import { IChat, IGroupedChat } from '@/types/chat';
import { IChatFolder } from '@/types/folder';

export type SetChatsType = IChat[];
export type SetGroupedChatsType = IGroupedChat[];
export type SetChatGroupsType = Map<string, IChat[]>;
export type SetSelectedChatType = IChat | undefined;
export type SetChatStatusType = boolean;
export type SetChatPagingType = {
  count: number;
  page: number;
  pageSize: number;
};
export type SetIsChatsLoadingType = boolean;
export type SetStopIdsType = string[];
export type SetChatFolderType = IChatFolder[];

interface ChatInitialState {
  chats: SetChatsType;
  groupedChats: SetGroupedChatsType;
  chatGroups: SetChatGroupsType;
  selectedChat?: SetSelectedChatType;
  chatsPaging: SetChatPagingType;
  isChatsLoading: SetIsChatsLoadingType;
  stopIds: SetStopIdsType;
  chatFolders: SetChatFolderType;
}

export const chatInitialState: ChatInitialState = {
  chats: [],
  groupedChats: [],
  chatGroups: new Map<string, IChat[]>(),
  selectedChat: undefined,
  chatsPaging: { count: 0, page: 1, pageSize: 50 },
  isChatsLoading: false,
  stopIds: [],
  chatFolders: [],
};

export enum ChatActionTypes {
  SET_CHATS = 'SET_CHATS',
  SET_GROUPED_CHATS = 'SET_GROUPED_CHATS',
  SET_CHAT_GROUPS = 'SET_CHAT_GROUPS',
  SET_CHATS_INCR = 'SET_CHATS_INCR',
  SET_SELECTED_CHAT = 'SET_SELECTED_CHAT',
  SET_CHAT_PAGING = 'SET_CHAT_PAGING',
  SET_IS_CHATS_LOADING = 'SET_IS_CHATS_LOADING',
  SET_STOP_IDS = 'SET_STOP_IDS',
  SET_CHAT_FOLDER = 'SET_CHAT_FOLDER',
}

export type ChatAction =
  | { type: ChatActionTypes.SET_CHATS; payload: SetChatsType }
  | { type: ChatActionTypes.SET_CHAT_GROUPS; payload: SetChatGroupsType }
  | { type: ChatActionTypes.SET_CHATS_INCR; payload: SetChatsType }
  | { type: ChatActionTypes.SET_SELECTED_CHAT; payload: SetSelectedChatType }
  | { type: ChatActionTypes.SET_CHAT_PAGING; payload: SetChatPagingType }
  | {
      type: ChatActionTypes.SET_IS_CHATS_LOADING;
      payload: SetIsChatsLoadingType;
    }
  | { type: ChatActionTypes.SET_STOP_IDS; payload: SetStopIdsType }
  | { type: ChatActionTypes.SET_CHAT_FOLDER; payload: SetChatFolderType }
  | { type: ChatActionTypes.SET_GROUPED_CHATS; payload: SetGroupedChatsType };

export default function chatReducer(
  state: ChatInitialState,
  action: ChatAction,
): ChatInitialState {
  switch (action.type) {
    case ChatActionTypes.SET_CHATS:
      return { ...state, chats: action.payload };
    case ChatActionTypes.SET_CHAT_GROUPS:
      return { ...state, chatGroups: action.payload };
    case ChatActionTypes.SET_SELECTED_CHAT:
      return { ...state, selectedChat: action.payload };
    case ChatActionTypes.SET_CHAT_PAGING:
      return { ...state, chatsPaging: action.payload };
    case ChatActionTypes.SET_IS_CHATS_LOADING:
      return { ...state, isChatsLoading: action.payload };
    case ChatActionTypes.SET_STOP_IDS:
      return { ...state, stopIds: action.payload };
    case ChatActionTypes.SET_CHAT_FOLDER:
      return { ...state, chatFolders: action.payload };
    case ChatActionTypes.SET_GROUPED_CHATS:
      return { ...state, groupedChats: action.payload };
    default:
      return state;
  }
}
