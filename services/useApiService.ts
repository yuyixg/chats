import { useCallback } from 'react';

import { useFetch } from '@/hooks/useFetch';

export interface GetModelsRequestProps {}

const useApiService = () => {
  const fetchService = useFetch();
  const getModels = useCallback(
    (params: GetModelsRequestProps, signal?: AbortSignal) => {
      return fetchService.post<GetModelsRequestProps>(`/api/models`, {
        body: {},
        headers: {
          'Content-Type': 'application/json',
        },
        signal,
      });
    },
    [fetchService]
  );

  return {
    getModels,
  };
};

export default useApiService;
