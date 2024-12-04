export type Role = 'assistant' | 'user' | 'system';
export const DEFAULT_TEMPERATURE = 0.5;

export interface Message {
  role: Role;
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
  chatModelId?: string;
  modelName: string;
  modelConfig: any;
  userModelConfig: any;
  isShared: boolean;
}
