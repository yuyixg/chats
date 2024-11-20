import { Content, Role } from '../chat';

import Decimal from 'decimal.js';

export interface PropsMessage {
  id: string;
  role: Role;
  content: Content;
  inputTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  inputPrice: Decimal;
  outputPrice: Decimal;
  duration: number;
  firstTokenLatency: number;
}
