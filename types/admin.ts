import { UserModel } from '@/models/userModels';
import { ChatModelConfig, ModelIds, ChatModelImageConfig, ModelType } from './model';
import { ChatModelApiConfig } from '@/models/models';

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
  enable?: boolean;
  apiConfig?: string;
  modelConfig: string;
  imgConfig?: string;
}

export interface PutModelParams {
  modelId: ModelIds;
  name: string;
  enable?: boolean;
  apiConfig?: string;
  modelConfig: string;
  imgConfig?: string;
}
