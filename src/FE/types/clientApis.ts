import { DBModelProvider } from "./model";
import { Paging } from "./page";
import { LoginType } from "./user";

export interface SingInParams {
  username?: string;
  password?: string;
  code?: string;
  provider?: string;
}

export interface SingInResult {
  sessionId: string;
  username: string;
  role: string;
  canRecharge: boolean;
}

export interface LoginConfigsResult {
  type: LoginType;
  configs?: {
    appId: string;
  };
}

export interface GetUserBalanceLogsResult {
  date: string;
  value: number;
}

export interface GetUserBalanceResult {
  balance: number;
  logs: GetUserBalanceLogsResult[];
}

export interface ModelUsageDto {
  modelId: number;
  tokens: number;
  counts: number;
  expires: string;
  isTerm: boolean;
  inputTokenPrice1M: number;
  outputTokenPrice1M: number;
}

export interface GetLoginProvidersResult {
  id: string;
  key: LoginType;
  config?: {
    appId: string;
  };
}

export interface GetSiteInfoResult {
  filingNumber: string;
  contact: {
    qqGroupNumber: string;
    qqGroupQrCodeLink: string;
  };
}

export interface GetChatsParams extends Paging {
  query?: string;
}

export interface ChatResult {
  id: string;
  title: string;
  modelId: number;
  modelName: string;
  modelConfig: any;
  userModelConfig: any;
  isShared: boolean;
  modelProviderId: DBModelProvider;
}

export interface PostChatParams {
  title: string;
  chatModelId?: string;
}

export interface PutChatParams {
  title?: string;
  isShared?: boolean;
}

export interface PostUserPassword {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface GetBalance7DaysUsageResult {
  date: string;
  costAmount: number;
}

export interface GetUserApiKeyResult {
  id: number;
  key: string;
  isRevoked: boolean;
  comment: string;
  allowEnumerate: boolean;
  allowAllModels: boolean;
  expires: string;
  createdAt: string;
  updatedAt: string;
  lastUsedAt: string;
  modelCount: number;
}
