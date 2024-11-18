export type Role = 'assistant' | 'user' | 'system';

export interface Message {
  role: Role;
  content: Content;
}

export interface Content {
  error?: string;
  text?: string;
  image?: string[];
}

export interface ChatBody {
  modelId: number;
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
