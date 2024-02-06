import { UserModel } from '@/models/userModels';
import { ModelIds, ModelType } from './model';

export const enum UserRole {
  'admin' = 'admin',
}

export interface GetUserModelResult {
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

export interface GetModelResult {
  modelId: ModelIds;
  name: string;
  rank: number;
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
