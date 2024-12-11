import { Dispatch, createContext } from 'react';

import { ActionType } from '@/hooks/useCreateReducer';

import { Prompt } from '@/types/prompt';
import { PromptSlim } from '@/types/prompt';

export interface PromptbarContextProps {
  state: PromptbarInitialState;
  dispatch: Dispatch<ActionType<PromptbarInitialState>>;
  handleCreatePrompt: () => void;
  handleDeletePrompt: (prompt: PromptSlim) => void;
  handleUpdatePrompt: (prompt: Prompt) => void;
}

export interface PromptbarInitialState {
  searchTerm: string;
  filteredPrompts: PromptSlim[];
}

export const initialState: PromptbarInitialState = {
  searchTerm: '',
  filteredPrompts: [],
};

const PromptbarContext = createContext<PromptbarContextProps>(undefined!);

export default PromptbarContext;
