import { FileUploadServerConfig } from './components/upload';

export interface ModelConfig {
  prompt: string;
  maxLength: number;
  temperature?: number;
  enableSearch?: boolean;
}

export interface Model {
  id: string;
  modelVersion: ModelVersions;
  name: string;
  modelProvider: ModelProviders;
  modelConfigOptions: {
    temperature: {
      min: number;
      max: number;
    };
  };
  modelConfig: ModelConfig;
  fileServerConfig: FileUploadServerConfig;
  fileConfig?: ChatModelFileConfig;
  enabled?: boolean;
  modelUsage: ModelUsage;
}

export enum ModelVersions {
  GPT_3_5 = 'gpt-3.5-turbo',
  GPT_4 = 'gpt-4',
  GPT_4_Vision = 'gpt-4-vision',
  ERNIE = 'ERNIE',
  QWen = 'qwen',
  QWen_Vl = 'qwen-vl',
  yi_34b_chat_0205 = 'yi-34b-chat-0205',
  yi_34b_chat_200k = 'yi-34b-chat-200k',
  yi_vl_plus = 'yi-vl-plus',
  moonshot_v1_8k = 'moonshot-v1-8k',
  moonshot_v1_32k = 'moonshot-v1-32k',
  moonshot_v1_128k = 'moonshot-v1-128k',
  GLM_4 = 'glm-4',
  GLM_4V = 'glm-4v',
  GLM_3_turbo = 'glm-3-turbo',
  HunYuan = 'hunyuan',
}

export enum ModelType {
  OpenAI = 'OpenAI',
  Azure = 'Azure',
  QianWen = 'QianWen',
  QianFan = 'QianFan',
  Spark = 'Spark',
  LingYi = 'LingYi',
  Moonshot = 'Moonshot',
  ZhiPuAI = 'ZhiPuAI',
  HunYuan = 'HunYuan',
}

export enum ModelProviders {
  OpenAI = 'OpenAI',
  Azure = 'Azure',
  QianWen = 'QianWen',
  QianFan = 'QianFan',
  Spark = 'Spark',
  LingYi = 'LingYi',
  Moonshot = 'Moonshot',
  ZhiPuAI = 'ZhiPuAI',
  HunYuan = 'HunYuan',
}

export enum DBModelProvider {
  Azure = 1,
  HunYuan = 2,
  LingYi = 3,
  Moonshot = 4,
  OpenAI = 5,
  QianFan = 6,
  QianWen = 7,
  Spark = 8,
  ZhiPuAI = 9,
}

export interface ChatModelFileConfig {
  type: string;
  maxSize: number;
  count: number;
}

export interface ChatModelApiConfig {
  host: string;
  apiKey: string;
  secret: string;
}

export interface ChatModelConfig {
  prompt: string;
  temperature: number;
  maxLength?: number;
  tokenLimit?: number;
  version?: string;
  organization?: string;
  deploymentName?: string;
  enableSearch?: boolean;
  model?: string;
}

export interface ChatModelPriceConfig {
  input: number;
  out: number;
}

export type ModelConfigType =
  | 'fileConfig'
  | 'apiConfig'
  | 'modelConfig'
  | 'priceConfig';

export interface ModelApiConfig {
  temperature: {
    min: number;
    max: number;
  };
}

export interface UserModelConfig extends ModelConfig {}

export interface Usages {
  balance: boolean;
  tokens: boolean;
  counts: boolean;
  expires: boolean;
}

export interface ModelUsage {
  modelId: string;
  tokens: string;
  counts: string;
  expires: string;
}
