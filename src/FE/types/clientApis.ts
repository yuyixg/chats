import { ChatStatus } from './chat';
import { DBModelProvider } from './model';
import { Paging } from './page';
import { LoginType } from './user';

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
  companyName: string;
}

export interface GetChatsParams extends Paging {
  groupId: string | null;
  query?: string;
}

export interface ChatResult {
  id: string;
  title: string;
  isShared: boolean;
  spans: ChatSpanDto[];
  leafMessageId?: string;
  updatedAt: string;
  isTopMost: boolean;
  groupId: string | null;
  tags: string[];
}

export interface ChatSpanDto {
  spanId: number;
  modelId: number;
  modelName: string;
  prompt: string;
  modelProviderId: DBModelProvider;
  temperature: number | null;
  enableSearch: boolean;
}

export interface PostChatParams {
  title: string;
  groupId: string | null;
  chatModelId?: string;
}

export interface PutChatParams {
  title?: string;
  isShared?: boolean;
  setsLeafMessageId?: boolean;
  leafMessageId?: string;
  isTopMost?: boolean;
  groupId?: string;
  setsGroupId?: boolean;
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

export interface PostUserChatSpanParams {
  modelId?: number;
  setTemperature?: boolean;
  temperature?: number | null;
  enableSearch?: boolean;
}

export interface PostUserChatSpanResult {
  spanId: number;
  modelId: number;
  modelName: string;
  modelProviderId: number;
  temperature: number;
  enableSearch: boolean;
}

interface GetUserChatResult {
  id: string;
  title: string;
  isShared: boolean;
  status: ChatStatus;
  spans: ChatSpanDto[];
  leafMessageId?: string;
  isTopMost: boolean;
  groupId: string;
  tags: string[];
  updatedAt: string;
}

export interface GetUserChatGroupWithMessagesResult {
  id: string;
  name: string;
  rank: 0;
  isExpanded: boolean;
  chats: {
    rows: GetUserChatResult[];
    count: 0;
  };
}

export interface PostChatGroupParams {
  name: string;
  rank?: number;
  isExpanded?: boolean;
}

export interface PutChatGroupParams {
  id: string;
  name?: string;
  rank?: number;
  isExpanded?: boolean;
}

export interface PutMoveChatGroupParams {
  groupId: string;
  beforeGroupId: string | null;
  afterGroupId: string | null;
}
