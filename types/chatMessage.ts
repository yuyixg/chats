import Decimal from 'decimal.js';
import { Message } from './chat';

export interface ChatMessage {
  id: string;
  parentId: string | null;
  childrenIds: string[];
  messages: Message[];
  tokenUsed?: number;
  calculatedPrice?: Decimal;
}

export interface MessageNode {
  id: string;
  parentId: string;
  messages: any[];
  childrenIds?: string[];
  tokenUsed: number;
  calculatedPrice: Decimal;
}
