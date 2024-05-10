import { ModelVersions, ModelType, ModelProviders } from './model';
import { Paging } from './page';
import { Message } from './chat';
import { PutFileServicesParams } from './file';
import Decimal from 'decimal.js';
import { StatusCode } from './statusCode';
import { ProviderType } from './user';
import { PayServiceType } from './pay';

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
  modelProvider: ModelProviders;
  modelVersion: ModelVersions;
  name: string;
  isDefault: boolean;
  rank: number;
  enabled: boolean;
  remarks: string;
  modelConfig: string;
  fileServiceId: string;
  modelKeysId: string;
  fileConfig: string;
  priceConfig: string;
}

export interface PutModelParams {
  modelId: string;
  name: string;
  enabled?: boolean;
  modelConfig: string;
  fileServiceId?: string;
  modelKeysId: string;
  fileConfig?: string;
  priceConfig: string;
}

export interface PostModelParams {
  modelProvider: ModelProviders;
  modelVersion: ModelVersions;
  name: string;
  enabled: boolean;
  modelConfig: string;
  modelKeysId: string;
  fileServiceId?: string;
  fileConfig?: string;
}

export interface PostUserParams {
  account: string;
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
  ip: string;
  username: string;
  url: string;
  method: string;
  statusCode: StatusCode;
  createdAt: string;
}

export interface GetRequestLogsDetailsResult extends GetRequestLogsListResult {
  headers: string;
  request: string;
  response: string;
  requestTime: number;
  responseTime: number;
  user: { username: string };
}

export interface GetLoginServicesResult {
  id: string;
  type: ProviderType;
  enabled: boolean;
  configs: string;
  createdAt: string;
}

export interface PostLoginServicesParams {
  type: ProviderType;
  enabled: boolean;
  configs: string;
}

export interface PutLoginServicesParams extends PostLoginServicesParams {
  id: string;
}

export interface GetPayServicesResult {
  id: string;
  type: PayServiceType;
  enabled: boolean;
  configs: string;
  createdAt: string;
}

export interface PostPayServicesParams {
  type: PayServiceType;
  enabled: boolean;
  configs: string;
}

export interface PutPayServicesParams extends PostPayServicesParams {
  id: string;
}

export interface GetModelKeysResult {
  id: string;
  name: string;
  type: ModelProviders;
  configs: string;
  createdAt: string;
}

export interface PostModelKeysParams {
  name: string;
  configs: string;
}

export interface PutModelKeysParams extends PostModelKeysParams {
  id: string;
}
