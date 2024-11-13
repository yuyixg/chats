import { useFetch } from '@/hooks/useFetch';

import {
  GetConfigsResult,
  GetFileServicesResult,
  GetInvitationCodeResult,
  GetLoginServicesResult,
  GetMessageDetailsResult,
  GetModelKeysResult,
  GetModelResult,
  GetPayServicesResult,
  GetRequestLogsDetailsResult,
  GetRequestLogsListResult,
  GetRequestLogsParams,
  GetUserInitialConfigResult,
  GetUserMessageParams,
  GetUserMessageResult,
  GetUserModelResult,
  GetUsersParams,
  GetUsersResult,
  LegacyModelProvider,
  LegacyModelReference,
  PostAndPutConfigParams,
  PostFileServicesParams,
  PostInvitationCodeParams,
  PostLoginServicesParams,
  PostModelKeysParams,
  PostModelParams,
  PostPayServicesParams,
  PostUserInitialConfigParams,
  PostUserModelParams,
  PostUserParams,
  PutFileServicesParams,
  PutInvitationCodeParams,
  PutLoginServicesParams,
  PutModelKeysParams,
  PutModelParams,
  PutPayServicesParams,
  PutUserBalanceParams,
  PutUserInitialConfigParams,
  PutUserModelParams,
  PutUserParams,
} from '@/types/adminApis';
import { ModelProviders } from '@/types/model';
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

export const putModels = (
  modelId: string,
  params: PutModelParams,
): Promise<any> => {
  const fetchService = useFetch();
  return fetchService.put(`/api/admin/models/${modelId}`, {
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

export const getUsers = (
  params: GetUsersParams,
): Promise<PageResult<GetUsersResult[]>> => {
  const fetchService = useFetch();
  return fetchService.get(
    `/api/admin/users?page=${params.page}&pageSize=${params.pageSize}&query=${
      params?.query || ''
    }`,
  );
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

export const putFileService = (id: string, params: PutFileServicesParams) => {
  const fetchService = useFetch();
  return fetchService.put(`/api/admin/file-service/${id}`, {
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

export const putModelKeys = (id: number, params: PutModelKeysParams) => {
  const fetchService = useFetch();
  return fetchService.put(`/api/admin/model-keys/${id}`, {
    body: params,
  });
};

export const deleteModelKeys = (id: number) => {
  const fetchService = useFetch();
  return fetchService.delete(`/api/admin/model-keys/${id}`);
};

export const getUserInitialConfig = () => {
  const fetchServer = useFetch();
  return fetchServer.get<GetUserInitialConfigResult[]>(
    '/api/admin/user-config',
  );
};

export const postUserInitialConfig = (params: PostUserInitialConfigParams) => {
  const fetchServer = useFetch();
  return fetchServer.post('/api/admin/user-config', { body: params });
};

export const putUserInitialConfig = (params: PutUserInitialConfigParams) => {
  const fetchServer = useFetch();
  return fetchServer.put('/api/admin/user-config', { body: params });
};

export const deleteUserInitialConfig = (id: string) => {
  const fetchServer = useFetch();
  return fetchServer.delete('/api/admin/user-config?id=' + id);
};

export const getConfigs = () => {
  const fetchServer = useFetch();
  return fetchServer.get<GetConfigsResult[]>('/api/admin/global-configs');
};

export const postConfigs = (params: PostAndPutConfigParams) => {
  const fetchServer = useFetch();
  return fetchServer.post('/api/admin/global-configs', { body: params });
};

export const putConfigs = (params: PostAndPutConfigParams) => {
  const fetchServer = useFetch();
  return fetchServer.put('/api/admin/global-configs', { body: params });
};

export const deleteConfigs = (id: string) => {
  const fetchServer = useFetch();
  return fetchServer.delete('/api/admin/global-configs?id=' + id);
};

export const getInvitationCode = () => {
  const fetchServer = useFetch();
  return fetchServer.get<GetInvitationCodeResult[]>(
    '/api/admin/invitation-code',
  );
};

export const putInvitationCode = (params: PutInvitationCodeParams) => {
  const fetchServer = useFetch();
  return fetchServer.put('/api/admin/invitation-code', { body: params });
};

export const postInvitationCode = (params: PostInvitationCodeParams) => {
  const fetchServer = useFetch();
  return fetchServer.post('/api/admin/invitation-code', { body: params });
};

export const deleteInvitationCode = (id: string) => {
  const fetchServer = useFetch();
  return fetchServer.delete('/api/admin/invitation-code/' + id);
};

export const getLegacyModelReference = (
  modelProviderName: ModelProviders,
  modelReferenceName: string,
) => {
  const fetchServer = useFetch();
  return fetchServer.get<LegacyModelReference>(
    `/api/legacy-model-reference/${modelProviderName}/${modelReferenceName}`,
  );
};

export const getLegacyModelProviderByName = (
  modelProviderName: ModelProviders,
) => {
  const fetchServer = useFetch();
  return fetchServer.get<LegacyModelProvider>(
    `/api/legacy-model-provider/${modelProviderName}`,
  );
};

export const getAllLegacyModelProviders = async () => {
  const fetchServer = useFetch();
  const data = await fetchServer.get<LegacyModelProvider[]>(
    `/api/legacy-model-provider`,
  );
  return data.reduce((acc, provider) => {
    acc[provider.name] = provider;
    return acc;
  }, {} as { [key: string]: LegacyModelProvider });
};
