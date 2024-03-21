import { useFetch } from '@/hooks/useFetch';

export const changeUserPassword = (newPassword: string) => {
  const fetchService = useFetch();
  return fetchService.put('/api/user', {
    body: { newPassword },
  });
};
