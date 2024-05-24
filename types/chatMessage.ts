import Decimal from 'decimal.js';
import { Content, Message, Role } from './chat';

export interface ChatMessage {
  id: string;
  parentId: string | null;
  childrenIds: string[];
  assistantChildrenIds: string[];
  role: Role;
  content: Content;
  modelName?: string;
  tokenUsed?: number;
  calculatedPrice?: Decimal;
}

export interface MessageNode {
  id: string;
  parentId: string | null;
  content: Content;
  childrenIds?: string[];
  assistantChildrenIds?: string[];
  modelName?: string;
  role: Role;
  tokenUsed: number;
  calculatedPrice: Decimal;
}
