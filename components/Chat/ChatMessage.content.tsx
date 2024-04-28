import { Dispatch, createContext } from 'react';
import { ActionType } from '@/hooks/useCreateReducer';

import { ChatMessageInitialState } from './ChatMessage.state';

export interface ChatMessageContextProps {
  state: ChatMessageInitialState;
  dispatch: Dispatch<ActionType<ChatMessageInitialState>>;
  handleChangeSelectChat: (chatId: string) => void;
}

const ChatMessageContext = createContext<ChatMessageContextProps>(undefined!);

export default ChatMessageContext;
