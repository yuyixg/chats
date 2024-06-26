import { Content, Message, Role } from './chat';

import Decimal from 'decimal.js';

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
  inputTokens: number;
  outputTokens: number;
  duration?: number;
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
