import { useFetch } from '@/hooks/useFetch';
import { GetModelsResult, GetUsersModelsResult, PutUserModelParams } from '@/types/admin';

export const getUserModels = (): Promise<GetUsersModelsResult[]> => {
  const fetchService = useFetch();
  return fetchService.post('/api/admin/users');
};

export const putUserModel = (
  params: PutUserModelParams
): Promise<GetUsersModelsResult[]> => {
  const fetchService = useFetch();
  return fetchService.put('/api/admin/users', {
    body: params,
  });
};

export const getModels = (
  enable: boolean = true
): Promise<GetModelsResult[]> => {
  const fetchService = useFetch();
  return fetchService.post('/api/admin/models', {
    body: { enable },
  });
};
