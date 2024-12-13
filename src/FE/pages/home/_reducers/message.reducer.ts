import { ChatMessage } from '@/types/chatMessage';

export type SetMessagesType = ChatMessage[];
export type SetCurrentMessagesType = ChatMessage[];
export type SetLastMessageIdType = string;
export type SetCurrentMessageIdType = string;

interface MessageInitialState {
  selectMessages: SetMessagesType;
  currentMessages: SetCurrentMessagesType;
  selectMessageLastId: SetLastMessageIdType;
  currentChatMessageId: SetCurrentMessageIdType;
}

export const messageInitialState: MessageInitialState = {
  selectMessages: [],
  currentMessages: [],
  selectMessageLastId: '',
  currentChatMessageId: '',
};

export enum MessageActionTypes {
  SET_MESSAGES = 'SET_MESSAGES',
  SET_CURRENT_MESSAGES = 'SET_CURRENT_MESSAGES',
  SET_LAST_MESSAGE_ID = 'SET_LAST_MESSAGE_ID',
  SET_CURRENT_MESSAGE_ID = 'SET_CURRENT_MESSAGE_ID',
}

export type MessageAction =
  | { type: MessageActionTypes.SET_MESSAGES; payload: SetMessagesType }
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
      return { ...state, selectMessages: action.payload };
    case MessageActionTypes.SET_CURRENT_MESSAGES:
      return { ...state, currentMessages: action.payload };
    case MessageActionTypes.SET_LAST_MESSAGE_ID:
      return { ...state, selectMessageLastId: action.payload };
    case MessageActionTypes.SET_CURRENT_MESSAGE_ID:
      return { ...state, currentChatMessageId: action.payload };
    default:
      return state;
  }
}
