import { ChatMessage } from '@/types/chatMessage';

export interface ChatMessageInitialState {
  lastLeafId: string;
  filteredMessages: ChatMessage[];
}

export const initialState: ChatMessageInitialState = {
  filteredMessages: [],
  lastLeafId: '',
};
