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
