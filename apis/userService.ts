import { useFetch } from '@/hooks/useFetch';
import { SingInParams } from '@/types/user';
import { UserSession } from '@/utils/user';

export const changeUserPassword = (newPassword: string) => {
  const fetchService = useFetch();
  return fetchService.put('/api/user', {
    body: { newPassword },
  });
};

export const getUserMessages = () => {
  const fetchService = useFetch();
  return fetchService.get('/api/messages');
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

export const singIn = (params: SingInParams): Promise<UserSession> => {
  const fetchServer = useFetch();
  return fetchServer.post('/api/public/login', { body: params });
};
