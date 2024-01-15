import { Dispatch, createContext } from 'react';

import { ActionType } from '@/hooks/useCreateReducer';

import { KeyValuePair } from '@/types/data';
import { HomeInitialState } from './home.state';
import { Conversation } from '@/types/chat';

export interface HomeContextProps {
  state: HomeInitialState;
  dispatch: Dispatch<ActionType<HomeInitialState>>;
  handleNewConversation: () => void;
  handleSelectConversation: (conversation: Conversation) => void;
  handleUpdateConversation: (
    conversation: Conversation,
    data: KeyValuePair | KeyValuePair[]
  ) => void;
  hasModel: () => boolean;
}

const HomeContext = createContext<HomeContextProps>(undefined!);

export default HomeContext;
