import { ChatMessage } from './chatMessage';
import { FileServicesType } from './file';
import {
  ChatModelFileConfig,
  ChatModelPriceConfig,
  ModelConfig,
  ModelProviders,
  ModelVersions,
} from './model';
import { Paging } from './page';
import { PayServiceType } from './pay';
import { StatusCode } from './statusCode';
import { LoginType } from './user';

import Decimal from 'decimal.js';

export const enum UserRole {
  'admin' = 'admin',
}

export interface UserModelResult extends UserInitialModel {
  modelName?: string;
  modelVersion?: string;
}

export interface PutUserModelParams {
  userId: string;
  models: UserModelUpdateDto[];
}

export interface GetModelResult {
  modelId: number;
  modelProvider: ModelProviders;
  modelVersion: ModelVersions;
  name: string;
  rank: number;
  enabled: boolean;
  remarks: string;
  modelConfig: string;
  fileServiceId: string;
  modelKeysId: number;
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
  userModelCount: number;
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

export interface PostFileServicesParams {
  type: FileServicesType;
  name: string;
  enabled: boolean;
  configs: string;
}

export interface PutFileServicesParams extends PostFileServicesParams { }

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

export interface PutModelKeysParams extends PostModelKeysParams { }

export interface PostPromptParams {
  name: string;
  content: string;
  description: string;
}

export interface PutPromptParams {
  id: string;
}

export interface LegacyModelProvider {
  name: ModelProviders;
  models: ModelVersions[];
  apiConfig: object;
  displayName: string;
  icon: string;
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

export interface GetConfigsResult {
  key: string;
  value: string;
  description: string;
}

export interface PostAndPutConfigParams {
  key: string;
  value: string;
  description: string;
}

export interface GetInvitationCodeResult {
  id: string;
  value: string;
  count: number;
  username: string;
}

export interface PostInvitationCodeParams {
  value: string;
  count: number;
}

export interface PutInvitationCodeParams {
  id: string;
  count: number;
}

export interface GetUserInitialConfigResult {
  id: string;
  name: string;
  loginType: string;
  price: Decimal;
  invitationCodeId: string;
  invitationCode: string;
  models: UserInitialModel[];
}

export interface PostUserInitialConfigParams {
  name: string;
  price: Decimal;
  loginType: string;
  invitationCodeId: string | null;
  models: UserInitialModel[];
}

export interface PutUserInitialConfigParams {
  id: string;
  name: string;
  price: Decimal;
  loginType: string;
  invitationCodeId: string | null;
  models: UserInitialModel[];
}

export interface UserInitialModel {
  modelId: number;
  tokens: number;
  counts: number;
  expires: string;
  enabled: boolean;
}

export interface UserModelUpdateDto extends UserInitialModel {
  id: number;
}

export interface UserModelDisplayDto extends UserModelUpdateDto {
  displayName: string;
  modelKeyName: string;
}

export class UserModelDisplay implements UserModelDisplayDto {
  id: number;
  modelId: number;
  tokens: number;
  counts: number;
  expires: string;
  enabled: boolean;
  displayName: string;
  modelKeyName: string;

  constructor(dto: UserModelDisplayDto) {
    this.id = dto.id;
    this.modelId = dto.modelId;
    this.tokens = dto.tokens;
    this.counts = dto.counts;
    this.expires = dto.expires;
    this.enabled = dto.enabled;
    this.displayName = dto.displayName;
    this.modelKeyName = dto.modelKeyName;
  }

  toUpdateDto(): UserModelUpdateDto {
    return {
      id: this.id,
      modelId: this.modelId,
      tokens: this.tokens,
      counts: this.counts,
      expires: this.expires,
      enabled: this.enabled,
    };
  }
}
