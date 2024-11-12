import Decimal from 'decimal.js';

export enum LoginType {
  'Keycloak' = 'Keycloak',
  'WeChat' = 'WeChat',
  'Phone' = 'Phone',
}

export enum SmsType {
  SignIn = 1,
  Register = 2,
}

export enum SmsStatus {
  WaitingForVerification = 1,
  Verified = 2,
}

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
  configs: {
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

export interface GetModelUsageResult {
  modelId: number;
  tokens: number;
  counts: number;
  expires: string;
  isTerm: boolean;
  promptTokenPrice1M: number;
  responseTokenPrice1M: number;
}

export interface GetLoginProvidersResult {
  id: string;
  key: LoginType;
  config: {
    appId?: string;
  };
}

export interface GetSiteInfoResult {
  filingNumber: string;
  contact: {
    qqGroupNumber: string;
    qqGroupQrCodeLink: string;
  };
}
