import { Message } from './chat';
import { ChatMessage } from './chatMessage';
import { PutFileServicesParams } from './file';
import {
  ChatModelFileConfig,
  ChatModelPriceConfig,
  ModelConfig,
  ModelProviders,
  ModelType,
  ModelVersions,
} from './model';
import { Paging } from './page';
import { PayServiceType } from './pay';
import { StatusCode } from './statusCode';
import { LoginType, UserInitialModel } from './user';

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
  modelProvider: ModelProviders;
  modelVersion: ModelVersions;
  name: string;
  rank: number;
  enabled: boolean;
  remarks: string;
  modelConfig: string;
  fileServiceId: string;
  modelKeysId: string;
  fileConfig: string;
  priceConfig: ChatModelPriceConfig;
}

export interface PutModelParams {
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

export interface GetUsersParams {
  query?: string;
  page: number;
  pageSize: number;
}
export interface GetUsersResult {
  id: string;
  account: string;
  username: string;
  role: string;
  email: string;
  phone: string;
  balance: Decimal;
  provider: string;
  createdAt: string;
  updatedAt: string;
  enabled: boolean;
  userModelId: string;
  models: UserInitialModel[];
}

export interface GetUserMessageParams extends Paging {
  query: string;
}

export interface GetUserMessageResult {
  id: string;
  username: string;
  isDeleted: boolean;
  isShared: boolean;
  title: string;
  modelName: string;
  createdAt: string;
}

export interface GetMessageDetailsResult {
  name: string;
  modelName?: string;
  modelTemperature?: number;
  modelPrompt?: number;
  messages: ChatMessage[];
}

export interface GetFileServicesResult extends PutFileServicesParams {
  id: string;
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
  type: LoginType;
  enabled: boolean;
  configs: string;
  createdAt: string;
}

export interface PostLoginServicesParams {
  type: LoginType;
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
  id: number;
  name: string;
  type: ModelProviders;
  enabledModelCount: number;
  totalModelCount: number;
  configs: string;
  createdAt: string;
}

export interface PostModelKeysParams {
  name: string;
  configs: string;
}

export interface PutModelKeysParams extends PostModelKeysParams {
}

export interface PostPromptParams {
  name: string;
  content: string;
  description: string;
}

export interface PutPromptParams {
  id: string;
}

export interface LegacyModelProvider {
  name: ModelProviders,
  models: ModelVersions[],
  apiConfig: object,
  displayName: string,
  icon: string
}

type TemperatureConfig = {
  min: number;
  max: number;
};

export type LegacyModelReference = {
  id: number;
  type: string;
  config: TemperatureConfig;
  modelConfig: ModelConfig;
  fileConfig: ChatModelFileConfig | null;
  priceConfig: ChatModelPriceConfig;
};