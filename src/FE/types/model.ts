export interface ModelConfig {
  prompt: string | null;
  maxLength: number;
  temperature?: number;
  enableSearch?: boolean;
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
  { id: 0, name: 'Test', icon: '/icons/logo.png' },
  { id: 1, name: 'Azure', icon: '/logos/azure.svg' },
  { id: 2, name: 'HunYuan', icon: '/logos/hunyuan.svg' },
  { id: 3, name: 'LingYi', icon: '/logos/lingyi.svg' },
  { id: 4, name: 'Moonshot', icon: '/logos/moonshot.svg' },
  { id: 5, name: 'OpenAI', icon: '/logos/openai.svg' },
  { id: 6, name: 'QianFan', icon: '/logos/qianfan.svg' },
  { id: 7, name: 'QianWen', icon: '/logos/qianwen.svg' },
  { id: 8, name: 'Spark', icon: '/logos/spark.svg' },
  { id: 9, name: 'ZhiPuAI', icon: '/logos/zhipuai.svg' },
];

export interface ChatModelFileConfig {
  maxSize: number;
  count: number;
}

export interface ChatModelPriceConfig {
  input: number;
  out: number;
}

export interface UserModelConfig extends ModelConfig { }
