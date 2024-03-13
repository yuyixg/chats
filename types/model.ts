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
  GPT_4_32K = 'gpt-4-32k',
  GPT_4_Vision = 'gpt-4-vision',
  ERNIE_Bot_4 = 'ERNIE-Bot-4',
  ERNIE_Bot_8K = 'ERNIE-Bot-8K',
  QWen_Vl_Plus = 'qwen-vl-plus',
}

export enum ModelType {
  GPT = 'GPT',
  QianWen = 'QianWen',
  QianFan = 'QianFan',
  Spark = 'Spark',
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
