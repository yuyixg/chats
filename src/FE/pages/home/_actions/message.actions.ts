import {
  MessageAction,
  MessageActionTypes,
  SetCurrentMessageIdType,
  SetCurrentMessagesType,
  SetLastMessageIdType,
  SetMessagesType,
} from '../_reducers/message.reducer';

export const setMessages = (messages: SetMessagesType): MessageAction => ({
  type: MessageActionTypes.SET_MESSAGES,
  payload: messages,
});

export const setCurrentMessages = (
  currentMessages: SetCurrentMessagesType,
): MessageAction => ({
  type: MessageActionTypes.SET_CURRENT_MESSAGES,
  payload: currentMessages,
});

export const setLastMessageId = (
  lastMessageId: SetLastMessageIdType,
): MessageAction => ({
  type: MessageActionTypes.SET_LAST_MESSAGE_ID,
  payload: lastMessageId,
});

export const setCurrentMessageId = (
  currentMessageId: SetCurrentMessageIdType,
): MessageAction => ({
  type: MessageActionTypes.SET_CURRENT_MESSAGE_ID,
  payload: currentMessageId,
});

export default function () {}
