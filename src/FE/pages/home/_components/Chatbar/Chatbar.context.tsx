import { Dispatch, createContext } from 'react';

import { ActionType } from '@/hooks/useCreateReducer';

import { ChatResult } from '@/types/clientApis';

export interface ChatbarContextProps {
  state: ChatbarInitialState;
  dispatch: Dispatch<ActionType<ChatbarInitialState>>;
  handleDeleteChat: (chatId: string) => void;
}
export interface ChatbarInitialState {
  searchTerm: string;
  filteredChats: ChatResult[];
}

export const initialState: ChatbarInitialState = {
  searchTerm: '',
  filteredChats: [],
};

const ChatbarContext = createContext<ChatbarContextProps>(undefined!);

export default ChatbarContext;
