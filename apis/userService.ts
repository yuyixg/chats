import { useFetch } from '@/hooks/useFetch';
import { PostPromptParams, PutPromptParams } from '@/types/admin';
import { ChatMessage } from '@/types/chatMessage';
import { Model } from '@/types/model';
import { Prompt } from '@/types/prompt';
import { GetUserBalanceResult, ProviderResult, SingInParams, SingInResult } from '@/types/user';

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
  return fetchService.get('/api/messages?chatId=' + chatId);
};

export const getChats = (): Promise<ChatResult[]> => {
  const fetchService = useFetch();
  return fetchService.get('/api/chats');
};

export const getChat = (id: string): Promise<ChatResult> => {
  const fetchService = useFetch();
  return fetchService.get('/api/chats?id=' + id);
};

export const postChats = (params: PostChatParams): Promise<ChatResult> => {
  const fetchService = useFetch();
  return fetchService.post('/api/chats', { body: params });
};

export const putChats = (params: PutChatParams) => {
  const fetchService = useFetch();
  return fetchService.put('/api/chats', { body: params });
};

export const deleteChats = (id: string) => {
  const fetchService = useFetch();
  return fetchService.delete('/api/chats?id=' + id);
};

export const putUserMessages = (
  id: string,
  name: string,
  isShared?: boolean
) => {
  const fetchService = useFetch();
  return fetchService.put('/api/messages', {
    body: {
      id,
      name,
      isShared,
    },
  });
};

export const deleteUserMessages = (id: string) => {
  const fetchService = useFetch();
  return fetchService.delete('/api/messages?id=' + id);
};

export const getCsrfToken = (): Promise<{ csrfToken: string }> => {
  const fetchServer = useFetch();
  return fetchServer.get('/api/auth/csrf');
};

export const singIn = (params: SingInParams): Promise<SingInResult> => {
  const fetchServer = useFetch();
  return fetchServer.post('/api/public/login', { body: params });
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
  return fetchServer.get<ProviderResult[]>('/api/public/login-provider');
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
