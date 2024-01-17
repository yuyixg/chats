export interface Model {
  modelId: ModelIds;
  name: string;
  type: ModelType;
  systemPrompt?: string;
  maxLength?: number;
  tokenLimit?: number;
  fileSizeLimit?: number;
  enable?: boolean;
}

export enum ModelIds {
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

export const Models = [
  {
    modelId: ModelIds.GPT_3_5,
    name: 'GPT-3.5',
    maxLength: 12000,
    tokenLimit: 4000,
    type: ModelType.GPT,
  },
  {
    modelId: ModelIds.GPT_4,
    name: 'GPT-4',
    maxLength: 24000,
    tokenLimit: 8000,
    type: ModelType.GPT,
  },
  {
    modelId: ModelIds.GPT_4_Vision,
    name: 'GPT-4-VISION',
    maxLength: 96000,
    tokenLimit: 32000,
    type: ModelType.GPT,
    fileSizeLimit: 10240,
  },
  {
    modelId: ModelIds.ERNIE_Bot_4,
    name: 'ERNIE-Bot-4',
    maxLength: 20000,
    tokenLimit: 5000,
    type: ModelType.QianFan,
  },
  {
    modelId: ModelIds.ERNIE_Bot_8K,
    name: 'ERNIE-Bot-8K',
    maxLength: 20000,
    tokenLimit: 5000,
    type: ModelType.QianFan,
  },
  {
    modelId: ModelIds.QWen_Vl_Plus,
    name: 'QianWen-VL-Plus',
    maxLength: 512,
    tokenLimit: 8192,
    type: ModelType.QianWen,
    fileSizeLimit: 10240,
  },
];
