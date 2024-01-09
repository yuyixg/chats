import { useCallback } from 'react';

import { useFetch } from '@/hooks/useFetch';
import { Model } from '@/types/model';

export interface GetModelsRequestProps {}

const useApiService = () => {
  const fetchService = useFetch();
  const getModels = useCallback(
    (params: GetModelsRequestProps, signal?: AbortSignal) => {
      return fetchService.post<Model[]>(`/api/models`, {
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
