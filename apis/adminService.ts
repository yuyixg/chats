import { useFetch } from '@/hooks/useFetch';

import {
  GetFileServicesResult,
  GetLoginServicesResult,
  GetMessageDetailsResult,
  GetModelKeysResult,
  GetModelResult,
  GetPayServicesResult,
  GetRequestLogsDetailsResult,
  GetRequestLogsListResult,
  GetRequestLogsParams,
  GetUserMessageParams,
  GetUserMessageResult,
  GetUserModelResult,
  GetUsersResult,
  PostLoginServicesParams,
  PostModelKeysParams,
  PostModelParams,
  PostPayServicesParams,
  PostUserModelParams,
  PostUserParams,
  PutLoginServicesParams,
  PutModelKeysParams,
  PutModelParams,
  PutPayServicesParams,
  PutUserBalanceParams,
  PutUserModelParams,
  PutUserParams,
} from '@/types/admin';
import { PostFileServicesParams, PutFileServicesParams } from '@/types/file';
import { PageResult } from '@/types/page';

export const getUserModels = (
  query?: string,
): Promise<GetUserModelResult[]> => {
  const fetchService = useFetch();
  return fetchService.get('/api/admin/user-models?query=' + query);
};

export const putUserModel = (params: PutUserModelParams): Promise<any> => {
  const fetchService = useFetch();
  return fetchService.put('/api/admin/user-models', {
    body: params,
  });
};

export const postUserModel = (params: PostUserModelParams): Promise<any> => {
  const fetchService = useFetch();
  return fetchService.post('/api/admin/user-models', {
    body: params,
  });
};

export const getModels = (all: boolean = true): Promise<GetModelResult[]> => {
  const fetchService = useFetch();
  return fetchService.get('/api/admin/models?all=' + all);
};

export const putModels = (params: PutModelParams): Promise<any> => {
  const fetchService = useFetch();
  return fetchService.put('/api/admin/models', {
    body: params,
  });
};

export const deleteModels = (id: string): Promise<any> => {
  const fetchService = useFetch();
  return fetchService.delete('/api/admin/models?id=' + id);
};

export const postModels = (params: PostModelParams): Promise<any> => {
  const fetchService = useFetch();
  return fetchService.post('/api/admin/models', {
    body: params,
  });
};

export const getUsers = (query?: string): Promise<GetUsersResult[]> => {
  const fetchService = useFetch();
  return fetchService.get('/api/admin/users?query=' + query);
};

export const postUser = (params: PostUserParams) => {
  const fetchService = useFetch();
  return fetchService.post('/api/admin/users', {
    body: params,
  });
};

export const putUser = (params: PutUserParams) => {
  const fetchService = useFetch();
  return fetchService.put('/api/admin/users', {
    body: params,
  });
};

export const putUserBalance = (params: PutUserBalanceParams) => {
  const fetchService = useFetch();
  return fetchService.put('/api/admin/user-balances', {
    body: params,
  });
};

export const getMessages = (
  params: GetUserMessageParams,
): Promise<PageResult<GetUserMessageResult[]>> => {
  const { query = null, page = 1, pageSize = 12 } = params;
  const fetchService = useFetch();
  return fetchService.get(
    `/api/admin/messages?page=${page}&pageSize=${pageSize}&query=${query}`,
  );
};

export const getMessageDetails = (
  chatId: string,
): Promise<GetMessageDetailsResult> => {
  const fetchService = useFetch();
  return fetchService.get(`/api/admin/message-details?chatId=${chatId}`);
};

export const getFileServices = (
  select: boolean = false,
): Promise<GetFileServicesResult[]> => {
  const fetchService = useFetch();
  return fetchService.get(
    '/api/admin/file-service?select=' + (!select ? '' : true),
  );
};

export const postFileService = (params: PostFileServicesParams) => {
  const fetchService = useFetch();
  return fetchService.post('/api/admin/file-service', {
    body: params,
  });
};

export const putFileService = (params: PutFileServicesParams) => {
  const fetchService = useFetch();
  return fetchService.put('/api/admin/file-service', {
    body: params,
  });
};

export const getShareMessage = (
  chatId: string,
): Promise<GetMessageDetailsResult> => {
  const fetchService = useFetch();
  return fetchService.get(`/api/public/messages?chatId=${chatId}`);
};

export const getRequestLogs = (
  params: GetRequestLogsParams,
): Promise<PageResult<GetRequestLogsListResult[]>> => {
  const fetchService = useFetch();
  return fetchService.post(`/api/admin/request-logs`, { body: { ...params } });
};

export const getRequestLogDetails = (
  id: string,
): Promise<GetRequestLogsDetailsResult> => {
  const fetchService = useFetch();
  return fetchService.get(`/api/admin/request-logs?id=` + id);
};

export const getLoginServices = (): Promise<GetLoginServicesResult[]> => {
  const fetchService = useFetch();
  return fetchService.get('/api/admin/login-service');
};

export const postLoginService = (params: PostLoginServicesParams) => {
  const fetchService = useFetch();
  return fetchService.post('/api/admin/login-service', {
    body: params,
  });
};

export const putLoginService = (params: PutLoginServicesParams) => {
  const fetchService = useFetch();
  return fetchService.put('/api/admin/login-service', {
    body: params,
  });
};

export const getPayServices = (): Promise<GetPayServicesResult[]> => {
  const fetchService = useFetch();
  return fetchService.get('/api/admin/pay-service');
};

export const postPayService = (params: PostPayServicesParams) => {
  const fetchService = useFetch();
  return fetchService.post('/api/admin/pay-service', {
    body: params,
  });
};

export const putPayService = (params: PutPayServicesParams) => {
  const fetchService = useFetch();
  return fetchService.put('/api/admin/pay-service', {
    body: params,
  });
};

export const getModelKeys = (): Promise<GetModelKeysResult[]> => {
  const fetchService = useFetch();
  return fetchService.get('/api/admin/model-keys');
};

export const postModelKeys = (params: PostModelKeysParams) => {
  const fetchService = useFetch();
  return fetchService.post('/api/admin/model-keys', {
    body: params,
  });
};

export const putModelKeys = (params: PutModelKeysParams) => {
  const fetchService = useFetch();
  return fetchService.put('/api/admin/model-keys', {
    body: params,
  });
};

export const deleteModelKeys = (id: string) => {
  const fetchService = useFetch();
  return fetchService.delete('/api/admin/model-keys?id=' + id);
};
