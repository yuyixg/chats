import { Model } from './model';

export type Role = 'assistant' | 'user';

export interface LingJiContent {
  text?: string | undefined;
  image?: string;
}

export interface QianWenContent {
  text?: string;
  image?: string;
}

export interface GPTContent {
  type: 'text' | 'image_url';
  image_url?: {
    url: string;
  };
  text?: string;
}

export interface Content {
  text?: string;
  image?: string[];
}

export interface Message {
  role: Role;
  content: Content;
}

export interface QFMessage {
  role: Role;
  content: string;
}

export interface GPT4Message {
  role: Role;
  content: string;
}

export interface GPT4VisionMessageContent {
  type?: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
  };
}

export interface GPT4VisionMessage {
  role: Role;
  content: GPT4VisionMessageContent[];
}

export interface QianWenMessage {
  role: Role;
  content: QianWenContent[];
}

export interface ChatBody {
  model: Model;
  messages: Message[];
  prompt: string;
  temperature: number;
}

export interface Conversation {
  id: string;
  name: string;
  messages: Message[];
  model: Model;
  prompt: string;
  temperature: number;
}
