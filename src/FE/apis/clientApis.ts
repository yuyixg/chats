import { useFetch } from '@/hooks/useFetch';

import { calculateMessages } from '@/utils/message';

import { AdminModelDto, PostPromptParams } from '@/types/adminApis';
import { ChatMessage } from '@/types/chatMessage';
import {
  ChatResult,
  GetBalance7DaysUsageResult,
  GetChatsParams,
  GetLoginProvidersResult,
  GetSiteInfoResult,
  GetUserApiKeyResult,
  GetUserBalanceResult,
  LoginConfigsResult,
  ModelUsageDto,
  PostChatParams,
  PostUserPassword,
  PutChatParams,
  SingInParams,
  SingInResult,
} from '@/types/clientApis';
import { PageResult } from '@/types/page';
import { IdName, Prompt } from '@/types/prompt';
import { SmsType } from '@/types/user';

export const changeUserPassword = (params: PostUserPassword) => {
  const fetchService = useFetch();
  return fetchService.put('/api/user/reset-password', {
    body: { ...params },
  });
};

export const getUserMessages = (chatId: string): Promise<ChatMessage[]> => {
  const fetchService = useFetch();
  return fetchService.get(`/api/messages/${chatId}`).then((data: any) => {
    return calculateMessages(data) as any;
  });
};

export const getChatsByPaging = (
  params: GetChatsParams,
): Promise<PageResult<ChatResult[]>> => {
  const { query, page, pageSize } = params;
  const fetchService = useFetch();
  return fetchService.get(
    `/api/user/chats?page=${page}&pageSize=${pageSize}&query=${query || ''}`,
  );
};

export const getChat = (id: string): Promise<ChatResult> => {
  const fetchService = useFetch();
  return fetchService.get('/api/user/chats/' + id);
};

export const postChats = (params: PostChatParams): Promise<ChatResult> => {
  const fetchService = useFetch();
  return fetchService.post('/api/user/chats', { body: params });
};

export const putChats = (chatId: string, params: PutChatParams) => {
  const fetchService = useFetch();
  return fetchService.put(`/api/user/chats/${chatId}`, { body: params });
};

export const deleteChats = (id: string) => {
  const fetchService = useFetch();
  return fetchService.delete(`/api/user/chats/${id}`);
};

export const getCsrfToken = (): Promise<{ csrfToken: string }> => {
  const fetchServer = useFetch();
  return fetchServer.get('/api/auth/csrf');
};

export const singIn = (params: SingInParams): Promise<SingInResult> => {
  const fetchServer = useFetch();
  return fetchServer.post('/api/public/account-login', { body: params });
};

export const getUserModels = () => {
  const fetchServer = useFetch();
  return fetchServer.get<AdminModelDto[]>(`/api/models`);
};

export const getUserBalance = () => {
  const fetchServer = useFetch();
  return fetchServer.get<GetUserBalanceResult>('/api/user/balance');
};

export const getUserBalanceOnly = () => {
  const fetchServer = useFetch();
  return fetchServer.get<number>('/api/user/balance-only');
};

export const getBalance7DaysUsage = () => {
  const fetchServer = useFetch();
  return fetchServer.get<GetBalance7DaysUsageResult[]>(
    `/api/user/7-days-usage?timezoneOffset=${new Date().getTimezoneOffset()}`,
  );
};

export const getLoginProvider = () => {
  const fetchServer = useFetch();
  return fetchServer.get<LoginConfigsResult[]>('/api/public/login-provider');
};

export const getUserPrompts = () => {
  const fetchServer = useFetch();
  return fetchServer.get<Prompt[]>('/api/prompts');
};

export const getUserPromptBrief = () => {
  const fetchServer = useFetch();
  return fetchServer.get<IdName[]>('/api/prompts/brief');
};

export const getUserPromptDetail = (id: number) => {
  const fetchServer = useFetch();
  return fetchServer.get<Prompt>('/api/prompts/' + id);
};

export const getDefaultPrompt = () => {
  const fetchServer = useFetch();
  return fetchServer.get<Prompt>('/api/prompts/default');
};

export const postUserPrompts = (params: PostPromptParams) => {
  const fetchServer = useFetch();
  return fetchServer.post('/api/prompts', { body: params });
};

export const putUserPrompts = (promptId: number, params: PostPromptParams) => {
  const fetchServer = useFetch();
  return fetchServer.put(`/api/prompts/${promptId}`, { body: params });
};

export const deleteUserPrompts = (id: number) => {
  const fetchServer = useFetch();
  return fetchServer.delete('/api/prompts?id=' + id);
};

const postSignCode = (
  phone: string,
  type: SmsType,
  invitationCode: string | null = null,
) => {
  const fetchServer = useFetch();
  return fetchServer.post('/api/public/sms', {
    body: { phone, type, invitationCode },
  });
};

export const sendLoginSmsCode = (phone: string) => {
  return postSignCode(phone, SmsType.SignIn);
};

export const sendRegisterSmsCode = (
  phone: string,
  invitationCode: string | undefined,
) => {
  return postSignCode(phone, SmsType.Register, invitationCode);
};

export const registerByPhone = (
  phone: string,
  smsCode: string,
  invitationCode: string,
): Promise<SingInResult> => {
  const fetchServer = useFetch();
  return fetchServer.post('/api/public/phone-register', {
    body: { phone, smsCode, invitationCode },
  });
};

export const signByPhone = (
  phone: string,
  smsCode: string,
): Promise<SingInResult> => {
  const fetchServer = useFetch();
  return fetchServer.post('/api/public/phone-login', {
    body: { phone, smsCode },
  });
};

export const getLoginProviders = () => {
  const fetchServer = useFetch();
  return fetchServer.get<GetLoginProvidersResult[]>(
    '/api/public/login-providers',
  );
};

export const getSiteInfo = () => {
  const fetchServer = useFetch();
  return fetchServer.get<GetSiteInfoResult>('/api/public/siteInfo');
};

export const putUserChatModel = (chatId: string, modelId: number) => {
  const fetchServer = useFetch();
  return fetchServer.put('/api/user/chats/' + chatId, {
    body: { modelId },
  });
};

export const getUserApiKey = () => {
  const fetchServer = useFetch();
  return fetchServer.get<GetUserApiKeyResult[]>('/api/user/api-key');
};

export const postUserApiKey = () => {
  const fetchServer = useFetch();
  return fetchServer.post<GetUserApiKeyResult>('/api/user/api-key');
};

export const putUserApiKey = (id: number, body: any) => {
  const fetchServer = useFetch();
  return fetchServer.put<string>('/api/user/api-key/' + id, { body });
};

export const deleteUserApiKey = (id: number) => {
  const fetchServer = useFetch();
  return fetchServer.delete('/api/user/api-key/' + id);
};

export const getModelUsage = (modelId: number) => {
  const fetchServer = useFetch();
  return fetchServer.get<ModelUsageDto>('/api/models/' + modelId + '/usage');
};
