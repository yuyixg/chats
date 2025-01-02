import { IChatMessage } from '@/types/chatMessage';

export type SetMessagesType = IChatMessage[];
export type SetSelectedMessagesType = IChatMessage[][];

interface MessageInitialState {
  messages: SetMessagesType;
  selectedMessages: SetSelectedMessagesType;
}

export const messageInitialState: MessageInitialState = {
  messages: [],
  selectedMessages: [],
};

export enum MessageActionTypes {
  SET_MESSAGES = 'SET_MESSAGES',
  SET_SELECTED_MESSAGES = 'SET_SELECTED_MESSAGES',
}

export type MessageAction =
  | {
      type: MessageActionTypes.SET_MESSAGES;
      payload: SetMessagesType;
    }
  | {
      type: MessageActionTypes.SET_SELECTED_MESSAGES;
      payload: SetSelectedMessagesType;
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
    default:
      return state;
  }
}
