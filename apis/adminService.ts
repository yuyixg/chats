import { useFetch } from '@/hooks/useFetch';
import {
  CreateUserParams,
  GetMessageDetailsResult,
  GetModelResult,
  GetUserMessageParams,
  GetUserMessageResult,
  GetUserModelResult,
  GetUsersResult,
  PostModelParams,
  PostUserModelParams,
  PutModelParams,
  PutUserModelParams,
  PutUserParams,
} from '@/types/admin';
import { PageResult } from '@/types/page';

export const getUserModels = (
  query?: string
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

export const createUser = (params: CreateUserParams) => {
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

export const getMessages = (
  params: GetUserMessageParams
): Promise<PageResult<GetUserMessageResult[]>> => {
  const { query = null, page = 1, pageSize = 12 } = params;
  const fetchService = useFetch();
  return fetchService.get(
    `/api/admin/messages?page=${page}&pageSize=${pageSize}&query=${query}`
  );
};

export const getMessageDetails = (messageId: string): Promise<GetMessageDetailsResult> => {
  const fetchService = useFetch();
  return fetchService.get(`/api/admin/message-details?messageId=${messageId}`);
};
