import { Content, Role } from './chat';

// Enum equivalent to SseResponseKind
export enum SseResponseKind {
  StopId = 0,
  Segment = 1,
  Error = 2,
  End = 3,
}

// Discriminated unions for SseResponseLine
interface SseResponseLineStopId {
  k: SseResponseKind.StopId; // Kind is StopId
  r: string; // Result is a string
}

interface SseResponseLineSegment {
  k: SseResponseKind.Segment; // Kind is Segment
  r: string; // Result is a string
}

interface SseResponseLineError {
  k: SseResponseKind.Error; // Kind is Error
  r: string; // Result is a string
}

interface SseResponseLineEnd {
  k: SseResponseKind.End; // Kind is End
  r: SseEndMessage; // Result is SseEndMessage
}

// Definition of SseEndMessage
interface SseEndMessage {
  requestMessage: ChatMessage | null; // May be null
  responseMessage: ChatMessage; // Required
}

// Combined type for SseResponseLine
export type SseResponseLine =
  | SseResponseLineStopId
  | SseResponseLineSegment
  | SseResponseLineError
  | SseResponseLineEnd;

export interface ChatMessage {
  id: string;
  parentId: string | null;
  childrenIds?: string[];
  assistantChildrenIds?: string[];
  role: Role;
  content: Content;
  modelName?: string;
  modelId?: number;
  inputPrice?: number;
  outputPrice?: number;
  inputTokens?: number;
  outputTokens?: number;
  reasoningTokens?: number;
  duration?: number;
  firstTokenLatency?: number;
}

export interface MessageNode {
  id: string;
  parentId: string | null;
  content: Content;
  childrenIds?: string[];
  assistantChildrenIds?: string[];
  modelName?: string;
  role: Role;
  inputTokens?: number;
  outputTokens?: number;
  reasoningTokens?: number;
  inputPrice?: number;
  outputPrice?: number;
}
