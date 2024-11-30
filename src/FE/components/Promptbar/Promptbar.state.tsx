import { PromptSlim } from '@/types/prompt';

export interface PromptbarInitialState {
  searchTerm: string;
  filteredPrompts: PromptSlim[];
}

export const initialState: PromptbarInitialState = {
  searchTerm: '',
  filteredPrompts: [],
};
