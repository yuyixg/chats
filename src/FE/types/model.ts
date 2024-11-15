import { FileUploadServerConfig } from './components/upload';

import { GetModelUsageResult } from './clientApis';

export interface ModelConfig {
  prompt: string;
  maxLength: number;
  temperature?: number;
  enableSearch?: boolean;
}

export interface Model {
  id: string;
  modelVersion: string;
  name: string;
  modelProvider: string;
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
  modelUsage: GetModelUsageResult;
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

export type FEModelProvider = {
  id: number;
  name: string;
  icon: string;
};

export const feModelProviders: FEModelProvider[] = [
  { id: 0, name: 'Test', icon: '../icons/logo.png' },
  { id: 1, name: 'Azure', icon: 'azure.svg' },
  { id: 2, name: 'HunYuan', icon: 'hunyuan.svg' },
  { id: 3, name: 'LingYi', icon: 'lingyi.svg' },
  { id: 4, name: 'Moonshot', icon: 'moonshot.svg' },
  { id: 5, name: 'OpenAI', icon: 'openai.svg' },
  { id: 6, name: 'QianFan', icon: 'qianfan.svg' },
  { id: 7, name: 'QianWen', icon: 'qianwen.svg' },
  { id: 8, name: 'Spark', icon: 'spark.svg' },
  { id: 9, name: 'ZhiPuAI', icon: 'zhipuai.svg' },
];

export interface ChatModelFileConfig {
  type: string;
  maxSize: number;
  count: number;
}

export interface ChatModelPriceConfig {
  input: number;
  out: number;
}

export interface UserModelConfig extends ModelConfig {}
