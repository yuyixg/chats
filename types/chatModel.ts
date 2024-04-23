import { ChatModelConfig, ChatModelFileConfig } from './model';
import { ModelKeysTemplate } from './modelKeys';

export interface ChatModels {
  id: string;
  enabled: boolean;
  modelVersion: string;
  apiConfig: ModelKeysTemplate;
  fileConfig: ChatModelFileConfig;
  modelConfig: ChatModelConfig;
  priceConfig: { input: number; out: number };
}
