import { ChatMessage } from './chatMessage';
import { FileServicesType } from './file';
import {
  ChatModelPriceConfig,
  DBModelProvider,
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

export interface AdminModelDto {
  modelId: number;
  modelProviderId: number;
  modelReferenceId: number;
  name: string;
  rank: number | null;
  enabled: boolean;
  fileServiceId: string;
  modelKeyId: number;
  deploymentName: string | null;
  inputTokenPrice1M: number;
  outputTokenPrice1M: number;
}

export interface UpdateModelDto {
  name: string;
  modelReferenceId: number;
  enabled: boolean;
  deploymentName: string | null;
  modelKeyId: number;
  fileServiceId: string | null;
  inputTokenPrice1M: number;
  outputTokenPrice1M: number;
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

export class GetModelKeysResult {
  id: number;
  modelProviderId: number;
  name: string;
  enabledModelCount: number;
  totalModelCount: number;
  host: string | null;
  secret: string | null;
  createdAt: string;

  constructor(dto: any) {
    this.id = dto.id;
    this.modelProviderId = dto.modelProviderId;
    this.name = dto.name;
    this.enabledModelCount = dto.enabledModelCount;
    this.totalModelCount = dto.totalModelCount;
    this.host = dto.host;
    this.secret = dto.secret;
    this.createdAt = dto.createdAt;
  }

  toConfigs() {
    return {
      host: this.host,
      secret: this.secret,
    };
  }
}

export interface PostModelKeysParams {
  modelProviderId: number;
  name: string;
  host: string | null;
  secret: string | null;
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

export interface SimpleModelReferenceDto {
  id: number;
  name: string;
}

export interface ModelProviderInitialConfig {
  initialHost: string | null;
  initialSecret: string | null;
}

export interface ModelReferenceDto extends SimpleModelReferenceDto {
  modelProviderId: DBModelProvider;
  minTemperature: number;
  maxTemperature: number;
  allowVision: boolean;
  allowSearch: boolean;
  contextWindow: number;
  maxResponseTokens: number;
  promptTokenPrice1M: number;
  responseTokenPrice1M: number;
  rawPromptTokenPrice1M: number;
  rawResponseTokenPrice1M: number;
  currencyCode: string;
  exchangeRate: number;
}