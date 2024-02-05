import { useFetch } from '@/hooks/useFetch';
import {
  GetModelsResult,
  GetUsersModelsResult,
  PutModelParams,
  PutUserModelParams,
} from '@/types/admin';

export const getUserModels = (): Promise<GetUsersModelsResult[]> => {
  const fetchService = useFetch();
  return fetchService.post('/api/admin/users');
};

export const putUserModel = (params: PutUserModelParams): Promise<any> => {
  const fetchService = useFetch();
  return fetchService.put('/api/admin/users', {
    body: params,
  });
};

export const getModels = (all: boolean = true): Promise<GetModelsResult[]> => {
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
