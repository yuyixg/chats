import { ChatMessage } from '@/types/chatMessage';

export type SetMessagesType = ChatMessage[];
export type SetSelectedMessagesType = ChatMessage[][];
export type SetCurrentMessagesType = ChatMessage[];
export type SetLastMessageIdType = string;
export type SetCurrentMessageIdType = string;

interface MessageInitialState {
  messages: SetMessagesType;
  selectedMessages: SetSelectedMessagesType;
  currentMessages: SetCurrentMessagesType;
  selectedMessageLastId: SetLastMessageIdType;
  currentChatMessageId: SetCurrentMessageIdType;
}

export const messageInitialState: MessageInitialState = {
  messages: [],
  selectedMessages: [],
  currentMessages: [],
  selectedMessageLastId: '',
  currentChatMessageId: '',
};

export enum MessageActionTypes {
  SET_MESSAGES = 'SET_MESSAGES',
  SET_SELECTED_MESSAGES = 'SET_SELECTED_MESSAGES',
  SET_CURRENT_MESSAGES = 'SET_CURRENT_MESSAGES',
  SET_LAST_MESSAGE_ID = 'SET_LAST_MESSAGE_ID',
  SET_CURRENT_MESSAGE_ID = 'SET_CURRENT_MESSAGE_ID',
}

export type MessageAction =
  | {
      type: MessageActionTypes.SET_MESSAGES;
      payload: SetMessagesType;
    }
  | {
      type: MessageActionTypes.SET_SELECTED_MESSAGES;
      payload: SetSelectedMessagesType;
    }
  | {
      type: MessageActionTypes.SET_CURRENT_MESSAGES;
      payload: SetCurrentMessagesType;
    }
  | {
      type: MessageActionTypes.SET_LAST_MESSAGE_ID;
      payload: SetLastMessageIdType;
    }
  | {
      type: MessageActionTypes.SET_CURRENT_MESSAGE_ID;
      payload: SetCurrentMessageIdType;
    };

export default function messageReducer(
  state: MessageInitialState,
  action: MessageAction,
): MessageInitialState {
  switch (action.type) {
    case MessageActionTypes.SET_MESSAGES:
      return { ...state, messages: action.payload };
    case MessageActionTypes.SET_SELECTED_MESSAGES:
      return { ...state, selectedMessages: action.payload };
    case MessageActionTypes.SET_CURRENT_MESSAGES:
      return { ...state, currentMessages: action.payload };
    case MessageActionTypes.SET_LAST_MESSAGE_ID:
      return { ...state, selectedMessageLastId: action.payload };
    case MessageActionTypes.SET_CURRENT_MESSAGE_ID:
      return { ...state, currentChatMessageId: action.payload };
    default:
      return state;
  }
}
