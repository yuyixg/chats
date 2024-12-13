import {
  ChatAction,
  ChatActionTypes,
  SetChatPagingType,
  SetChatStatusType,
  SetChatsType,
  SetMessageIsStreamingType,
  SetSelectedChatType,
} from '../_reducers/chat.reducer';

export const setChats = (chats: SetChatsType): ChatAction => ({
  type: ChatActionTypes.SET_CHATS,
  payload: chats,
});

export const setChatsIncr = (chats: SetChatsType): ChatAction => ({
  type: ChatActionTypes.SET_CHATS_INCR,
  payload: chats,
});

export const setSelectedChat = (chat?: SetSelectedChatType): ChatAction => ({
  type: ChatActionTypes.SET_SELECTED_CHAT,
  payload: chat,
});

export const setChatStatus = (status: SetChatStatusType): ChatAction => ({
  type: ChatActionTypes.SET_CHAT_STATUS,
  payload: status,
});

export const setChatPaging = (paging: SetChatPagingType): ChatAction => ({
  type: ChatActionTypes.SET_CHAT_PAGING,
  payload: paging,
});

export const setMessageIsStreaming = (
  paging: SetMessageIsStreamingType,
): ChatAction => ({
  type: ChatActionTypes.SET_MESSAGE_IS_STREAMING,
  payload: paging,
});
