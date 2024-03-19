import { UserModel } from '@/dbs/userModels';
import { ModelVersions, ModelType } from './model';
import { Paging } from './page';

export const enum UserRole {
  'admin' = 'admin',
}

export interface GetUserModelResult {
  userId: string;
  role: string;
  userModelId: string;
  userName: string;
  models: UserModelResult[];
}

export interface UserModelResult {
  modelId: string;
  modelName?: string;
  modelVersion?: string;
  enable?: boolean;
  tokens?: number | null;
  counts?: number | null;
  expires?: string | null;
}

export interface PutUserModelParams {
  userModelId: string;
  models: UserModel[];
}

export interface PostUserModelParams {
  userModelIds: string[];
  modelId: string;
}

export interface GetModelResult {
  modelId: string;
  modelVersion: ModelVersions;
  name: string;
  rank: number;
  type: ModelType;
  enable?: boolean;
  apiConfig?: string;
  modelConfig: string;
  imgConfig?: string;
}

export interface PutModelParams {
  modelId: string;
  name: string;
  enable?: boolean;
  apiConfig?: string;
  modelConfig: string;
  imgConfig?: string;
}

export interface PostModelParams {
  modelVersion: ModelVersions;
  name: string;
  enable: boolean;
  apiConfig: string;
  modelConfig: string;
  imgConfig?: string;
}

export interface CreateUserParams {
  username: string;
  password: string;
  role: string;
}

export interface PutUserParams extends CreateUserParams {
  id: string;
}

export interface GetUsersResult {
  id: string;
  username: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  enabled: boolean;
}

export interface GetUserMessageParams extends Paging {
  query: string;
}

export interface GetUserMessageResult {
  id: string;
  username: string;
  chatCount: number;
  tokenCount: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}
