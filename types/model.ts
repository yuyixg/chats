export interface Model {
  modelId: string;
  modelVersion: ModelVersions;
  name: string;
  type: ModelType;
  systemPrompt: string;
  maxLength?: number;
  tokenLimit?: number;
  imgConfig?: ChatModelImageConfig;
  enable?: boolean;
}

export enum ModelVersions {
  GPT_3_5 = 'gpt-3.5-turbo',
  GPT_4 = 'gpt-4',
  GPT_4_Vision = 'gpt-4-vision',
  ERNIE_Bot_4 = 'ERNIE-Bot-4',
  ERNIE_Bot_8K = 'ERNIE-Bot-8K',
  QWen_Vl_Plus = 'qwen-vl-plus',
  yi_34b_chat_0205 = 'yi-34b-chat-0205',
  yi_34b_chat_200k = 'yi-34b-chat-200k',
  yi_vl_plus = 'yi-vl-plus',
}

export enum ModelType {
  GPT = 'GPT',
  QianWen = 'QianWen',
  QianFan = 'QianFan',
  Spark = 'Spark',
  LingYi = 'LingYi',
}

export interface ChatModelImageConfig {
  count: number;
  maxSize: number;
}

export interface ChatModelConfig {
  prompt: string;
  maxLength?: number;
  tokenLimit?: number;
}

export type ModelConfigType = 'imgConfig' | 'apiConfig' | 'modelConfig';
