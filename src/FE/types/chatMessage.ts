import { Content, Role } from './chat';

// Enum equivalent to SseResponseKind
export enum SseResponseKind {
  StopId = 0,
  Segment = 1,
  Error = 2,
  UserMessage = 3,
  UpdateTitle = 4,
  TitleSegment = 5,
  ResponseMessage = 6,
}

// Discriminated unions for SseResponseLine
interface SseResponseLineStopId {
  k: SseResponseKind.StopId; // Kind is StopId
  r: string; // Result is a string
}

interface SseResponseLineSegment {
  i: number; // SpanId is required for Segment
  k: SseResponseKind.Segment; // Kind is Segment
  r: string; // Result is a string
}

interface SseResponseLineError {
  i: number; // SpanId is required for Error
  k: SseResponseKind.Error; // Kind is Error
  r: string; // Result is a string
}

interface SseResponseLineUserMessage {
  k: SseResponseKind.UserMessage; // Kind is UserMessage
  r: ChatMessage; // Result is ChatMessage
}

interface SseResponseLineResponseMessage {
  i: number; // SpanId is required for ResponseMessage
  k: SseResponseKind.ResponseMessage; // Kind is ResponseMessage
  r: ChatMessage; // Result is ChatMessage
}

interface SseResponseLineUpdateTitle {
  k: SseResponseKind.UpdateTitle; // Kind is UpdateTitle
  r: string; // Result is a string
}

interface SseResponseLineTitleSegment {
  k: SseResponseKind.TitleSegment; // Kind is TitleSegment
  r: string; // Result is a string
}

// Combined type for SseResponseLine
export type SseResponseLine =
  | SseResponseLineStopId
  | SseResponseLineSegment
  | SseResponseLineError
  | SseResponseLineUserMessage
  | SseResponseLineResponseMessage
  | SseResponseLineUpdateTitle
  | SseResponseLineTitleSegment;

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
