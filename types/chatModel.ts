import {
  ChatModelConfig,
  ChatModelFileConfig,
  ModelProviders,
  ModelVersions,
} from './model';
import { ModelKeysTemplate } from './modelKeys';

export interface ChatModels {
  id: string;
  enabled: boolean;
  modelProvider: ModelProviders;
  modelVersion: ModelVersions;
  apiConfig: ModelKeysTemplate;
  fileConfig: ChatModelFileConfig;
  modelConfig: ChatModelConfig;
  priceConfig: { input: number; out: number };
}
