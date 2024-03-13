import { useFetch } from '@/hooks/useFetch';
import {
  CreateUserParams,
  GetModelResult,
  GetUserModelResult,
  GetUsersResult,
  PostModelParams,
  PutModelParams,
  PutUserModelParams,
  PutUserParams,
} from '@/types/admin';

export const getUserModels = (
  query?: string
): Promise<GetUserModelResult[]> => {
  const fetchService = useFetch();
  return fetchService.post('/api/admin/user-models', { body: { query } });
};

export const putUserModel = (params: PutUserModelParams): Promise<any> => {
  const fetchService = useFetch();
  return fetchService.put('/api/admin/user-models', {
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
