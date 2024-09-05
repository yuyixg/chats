export type Role = 'assistant' | 'user' | 'system';

export interface GPT4VisionMessage {
  role: Role;
  content: GPT4VisionContent[];
}

export interface GPT4VisionContent {
  type?: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
  };
}

export interface QianFanMessage {
  role: Role;
  content: string;
}

export interface QianWenMessage {
  role: Role;
  content: QianWenContent[];
}

export interface QianWenMaxMessage {
  role: Role;
  content: string;
}

export interface QianWenContent {
  text?: string;
  image?: string;
}

export interface Message {
  role: Role;
  content: Content;
}

export interface Content {
  text?: string;
  image?: string[];
}

export interface GPT4Message {
  role: Role;
  content: string;
}

export interface HunYuanMessage {
  Role: Role;
  Content: string;
}

export interface ChatBody {
  modelId: string;
  userMessage: Content;
  messageId: string | null;
  chatId: string;
  userModelConfig: any;
}

export interface IChat {
  id: string;
  title: string;
  chatModelId?: string;
  modelName: string;
  modelConfig: any;
  userModelConfig: any;
  isShared: boolean;
}
