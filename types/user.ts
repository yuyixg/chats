import Decimal from 'decimal.js';

export enum ProviderType {
  'KeyCloak' = 'KeyCloak',
  'WeChat' = 'WeChat',
}

export interface SingInParams {
  username?: string;
  password?: string;
  code?: string;
}

export interface SingInResult {
  sessionId: string;
  username: string;
  role: string;
  canRecharge: boolean;
}

export interface ProviderResult {
  type: ProviderType;
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
  price: Decimal;
  models: UserInitialModel[];
}

export interface PutUserInitialConfigParams {
  id: string;
  price: Decimal;
  models: UserInitialModel[];
}

export interface UserInitialModel {
  modelId: string;
  enabled: boolean;
  tokens: string;
  counts: string;
  expires: string;
}
