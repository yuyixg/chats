import { Model } from './model';

export type Role = 'assistant' | 'user';

export interface Content {
  text: string | undefined;
  image: string | undefined;
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
