import { useFetch } from '@/hooks/useFetch';
import {
  CreateUserParams,
  GetModelResult,
  GetUserModelResult,
  GetUsersResult,
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
  return fetchService.post('/api/admin/models', {
    body: { all },
  });
};

export const putModels = (params: PutModelParams): Promise<any> => {
  const fetchService = useFetch();
  return fetchService.put('/api/admin/models', {
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
