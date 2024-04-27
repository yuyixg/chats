import { Content } from './chat';

export interface ChatMessage {
  id: string | null;
  parentId: string | null;
  userMessage: Content;
  assistantResponse: string;
}
