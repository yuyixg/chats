import { ChatSpanDto } from './clientApis';

export type Role = 'assistant' | 'user' | 'system';
export enum ChatRole {
  'System' = 1,
  'User' = 2,
  'Assistant' = 3,
}
export const DEFAULT_TEMPERATURE = 0.5;

export enum ChatSpanStatus {
  None = 1,
  Chatting = 2,
  Failed = 3,
}

export enum ChatStatus {
  None = 1,
  Chatting = 2,
  Failed = 3,
}

export interface Message {
  role: ChatRole;
  content: Content;
}

export interface ImageDef {
  id: string;
  url: string;
}

export interface Content {
  error?: string;
  text?: string;
  fileIds?: ImageDef[];
}

export interface ContentRequest {
  text: string;
  fileIds: string[] | null;
}

export interface ChatBody {
  modelId: number;
  userMessage: ContentRequest;
  messageId: string | null;
  chatId: string;
  userModelConfig: any;
}

export interface IChat {
  id: string;
  title: string;
  isShared: boolean;
  status: ChatStatus;
  spans: ChatSpanDto[];
  leafMessageId?: string;
}
