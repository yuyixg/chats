import { FileServicesType } from './file';

export interface Model {
  id: string;
  modelVersion: ModelVersions;
  name: string;
  type: ModelType;
  systemPrompt: string;
  maxLength?: number;
  tokenLimit?: number;
  fileServerConfig: {
    id: string;
    type: FileServicesType;
  };
  fileConfig?: ChatModelFileConfig;
  enabled?: boolean;
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
  moonshot_v1_8k = 'moonshot-v1-8k',
  moonshot_v1_32k = 'moonshot-v1-32k',
  moonshot_v1_128k = 'moonshot-v1-128k',
}

export enum ModelType {
  GPT = 'GPT',
  QianWen = 'QianWen',
  QianFan = 'QianFan',
  Spark = 'Spark',
  LingYi = 'LingYi',
  Moonshot = 'moonshot',
}

export interface ChatModelFileConfig {
  type: string;
  fileMaxSize: number;
  maxCount: number;
}

export interface ChatModelConfig {
  prompt: string;
  maxLength?: number;
  tokenLimit?: number;
  version?: string;
  organization?: string;
  deploymentName?: string;
}

export interface ChatModelPrice {
  input: number;
  out: number;
}

export type ModelConfigType =
  | 'fileConfig'
  | 'apiConfig'
  | 'modelConfig'
  | 'priceConfig';
