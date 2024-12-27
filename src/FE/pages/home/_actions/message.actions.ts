import {
  MessageAction,
  MessageActionTypes,
  SetMessagesType,
  SetSelectedMessagesType,
} from '../_reducers/message.reducer';

export const setMessages = (messages: SetMessagesType): MessageAction => ({
  type: MessageActionTypes.SET_MESSAGES,
  payload: messages,
});

export const setSelectedMessages = (
  selectedMessages: SetSelectedMessagesType,
): MessageAction => ({
  type: MessageActionTypes.SET_SELECTED_MESSAGES,
  payload: selectedMessages,
});

export default function () {}
