import { useFetch } from '@/hooks/useFetch';

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

export const putUserMessages = (id: string, name: string) => {
  const fetchService = useFetch();
  return fetchService.put('/api/messages', {
    body: {
      id,
      name,
    },
  });
};

export const deleteUserMessages = (id: string) => {
  const fetchService = useFetch();
  return fetchService.delete('/api/messages?id=' + id);
};
