import { useFetch } from '@/hooks/useFetch';
import { GetUsersModelsResult } from '@/types/user';

export const getUsers = (): Promise<GetUsersModelsResult[]> => {
  const fetchService = useFetch();
  return fetchService.post('/api/admin/users');
};
