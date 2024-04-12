import { ModelVersions, ModelType } from './model';
import { Paging } from './page';
import { Message } from './chat';
import { PutFileServicesParams } from './file';
import Decimal from 'decimal.js';

export const enum UserRole {
  'admin' = 'admin',
}

export interface GetUserModelResult {
  userId: string;
  role: string;
  userModelId: string;
  userName: string;
  balance: Decimal;
  models: UserModelResult[];
}

export interface UserModelResult {
  modelId: string;
  modelName?: string;
  modelVersion?: string;
  enabled?: boolean;
  tokens: string;
  counts: string;
  expires: string;
}

export interface PutUserModelParams {
  userModelId: string;
  models: any[];
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
  enabled: boolean;
  apiConfig: string;
  modelConfig: string;
  fileServerId: string;
  fileConfig: string;
  priceConfig: string;
}

export interface PutModelParams {
  modelId: string;
  name: string;
  enabled?: boolean;
  apiConfig?: string;
  modelConfig: string;
  fileServerId?: string;
  fileConfig?: string;
  priceConfig: string;
}

export interface PostModelParams {
  modelVersion: ModelVersions;
  name: string;
  enabled: boolean;
  apiConfig: string;
  modelConfig: string;
  fileServerId?: string;
  fileConfig?: string;
}

export interface PostUserParams {
  username: string;
  password: string;
  role: string;
}

export interface PutUserParams extends PostUserParams {
  id: string;
}

export interface PutUserBalanceParams {
  userId: string;
  value: number;
}

export interface GetUsersResult {
  id: string;
  username: string;
  role: string;
  email: string;
  phone: string;
  balance: Decimal;
  provider: string;
  createdAt: string;
  updatedAt: string;
  enabled: boolean;
}

export interface GetUserMessageParams extends Paging {
  query: string;
}

export interface GetUserMessageResult {
  messageId: string;
  username: string;
  chatCount: number;
  totalPrice: Decimal;
  tokenCount: number;
  isDeleted: boolean;
  isShared: boolean;
  name: string;
  modelName: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetMessageDetailsResult {
  name: string;
  prompt: string;
  messages: Message[];
}

export interface GetFileServicesResult extends PutFileServicesParams {
  createdAt: string;
  updatedAt: string;
}

export interface GetRequestLogsParams extends Paging {
  query?: string;
  statusCode?: number;
}

export interface GetRequestLogsListResult {
  id: string;
  username: string;
  url: string;
  method: string;
  statusCode: number;
  createdAt: string;
}

export interface GetRequestLogsDetailsResult extends GetRequestLogsListResult {
  request: string;
  response: string;
}
