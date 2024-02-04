import { UserModel } from '@/models/userModels';
import { ModelIds, ModelImageConfig, ModelType } from './model';

export const enum UserRole {
  'admin' = 'admin',
}

export interface GetUsersModelsResult {
  userId: string;
  role: string;
  userModelId: string;
  userName: string;
  models: UserModel[];
}

export interface PutUserModelParams {
  userModelId: string;
  models: UserModel[];
}

export interface GetModelsResult {
  modelId: ModelIds;
  name: string;
  type: ModelType;
  systemPrompt: string;
  maxLength?: number;
  tokenLimit?: number;
  imgConfig?: ModelImageConfig;
  enable?: boolean;
}
