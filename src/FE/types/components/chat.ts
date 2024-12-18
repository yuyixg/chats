import { Content, Role } from '../chat';

export interface PropsMessage {
  id: string;
  role: Role;
  content: Content;
  inputTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  inputPrice: number;
  outputPrice: number;
  duration: number;
  firstTokenLatency: number;
}
