import { FileServicesType } from './file';
import { Model } from './model';

export type Role = 'assistant' | 'user';

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

export interface ChatBody {
  modelId: string;
  userMessage: Content;
  parentId?: string;
  chatId: string;
}

export interface Conversation {
  id: string;
  name: string;
  messages: Message[];
  model: Model;
  prompt: string;
  temperature: number;
  isShared: boolean;
  totalPrice?: number;
  fileServerConfig: {
    id: string;
    type: FileServicesType;
  };
}
