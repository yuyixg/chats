import { useFetch } from '@/hooks/useFetch';

import { calculateMessages } from '@/utils/message';

import { PostPromptParams, PutPromptParams } from '@/types/admin';
import { ChatMessage } from '@/types/chatMessage';
import { Model } from '@/types/model';
import { PageResult, Paging } from '@/types/page';
import { Prompt } from '@/types/prompt';
import {
  GetLoginProvidersResult,
  GetModelUsageResult,
  GetSiteInfoResult,
  GetUserBalanceResult,
  LoginConfigsResult,
  SingInParams,
  SingInResult,
  SmsType,
} from '@/types/user';

export interface GetChatsParams extends Paging {
  query?: string;
}

export interface ChatResult {
  id: string;
  title: string;
  chatModelId?: string;
  modelName: string;
  modelConfig: any;
  userModelConfig: any;
  isShared: boolean;
}

export interface PostChatParams {
  title: string;
  chatModelId?: string;
}

export interface PutChatParams {
  id: string;
  title?: string;
  isShared?: boolean;
}

export const changeUserPassword = (newPassword: string) => {
  const fetchService = useFetch();
  return fetchService.put('/api/user/change-password', {
    body: { newPassword },
  });
};

export const getUserMessages = (chatId: string): Promise<ChatMessage[]> => {
  const fetchService = useFetch();
  return fetchService
    .get('/api/messages?chatId=' + chatId)
    .then((data: any) => {
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

export const putChats = (params: PutChatParams) => {
  const fetchService = useFetch();
  return fetchService.put('/api/user/chats', { body: params });
};

export const stopChat = (chatId: string) => {
  const fetchService = useFetch();
  return fetchService.post('/api/user/chat-stop', { body: { chatId } });
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
  return fetchServer.get<Model[]>('/api/models');
};

export const getUserBalance = () => {
  const fetchServer = useFetch();
  return fetchServer.get<GetUserBalanceResult>('/api/user/balance');
};

export const getLoginProvider = () => {
  const fetchServer = useFetch();
  return fetchServer.get<LoginConfigsResult[]>('/api/public/login-provider');
};

export const getUserPrompts = () => {
  const fetchServer = useFetch();
  return fetchServer.get<Prompt[]>('/api/prompts');
};

export const postUserPrompts = (params: PostPromptParams) => {
  const fetchServer = useFetch();
  return fetchServer.post('/api/prompts', { body: params });
};

export const putUserPrompts = (params: PutPromptParams) => {
  const fetchServer = useFetch();
  return fetchServer.put('/api/prompts', { body: params });
};

export const deleteUserPrompts = (id: string) => {
  const fetchServer = useFetch();
  return fetchServer.delete('/api/prompts?id=' + id);
};

const postSignCode = (phone: string, type: SmsType, invitationCode: string | null = null) => {
  const fetchServer = useFetch();
  return fetchServer.post('/api/public/sms', { body: { phone, type, invitationCode } });
};

export const sendLoginSmsCode = (phone: string) => {
  return postSignCode(phone, SmsType.SignIn);
};

export const sendRegisterSmsCode = (phone: string, invitationCode: string | undefined) => {
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

export const getUserModelUsage = (modelId: string) => {
  const fetchServer = useFetch();
  return fetchServer.get<GetModelUsageResult>(
    '/api/user/model-usage?modelId=' + modelId,
  );
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

export const putUserChatModel = (chatId: string, modelId: string) => {
  const fetchServer = useFetch();
  return fetchServer.put('/api/user/chats/' + chatId, {
    body: { modelId },
  });
};
