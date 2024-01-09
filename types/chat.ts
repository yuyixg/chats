import { Model } from './model';

export type Role = 'assistant' | 'user';

export interface LingJiContent {
  text?: string | undefined;
  image?: string;
}

export interface GPTContent {
  type: 'text' | 'image_url';
  image_url?: {
    url: string;
  };
  text?: string;
}

export interface Message {
  role: Role;
  content: string;
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
