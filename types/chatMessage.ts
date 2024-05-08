import { Message } from './chat';

export interface ChatMessage {
  id: string;
  parentId: string | null;
  lastLeafId: string;
  childrenIds: string[];
  messages: Message[];
}
