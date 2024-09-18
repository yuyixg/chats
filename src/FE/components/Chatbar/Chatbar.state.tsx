import { ChatResult } from '@/apis/clientApis';

export interface ChatbarInitialState {
  searchTerm: string;
  filteredChats: ChatResult[];
}

export const initialState: ChatbarInitialState = {
  searchTerm: '',
  filteredChats: [],
};
