import { ChatResult } from '@/apis/userService';

export interface ChatbarInitialState {
  searchTerm: string;
  filteredChats: ChatResult[];
}

export const initialState: ChatbarInitialState = {
  searchTerm: '',
  filteredChats: [],
};
