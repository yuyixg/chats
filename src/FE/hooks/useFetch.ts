import toast from 'react-hot-toast';

import useTranslation from '@/hooks/useTranslation';

import { getApiUrl } from '@/utils/common';
import { getLoginUrl, getUserSession } from '@/utils/user';

export type RequestModel = {
  params?: object;
  headers?: object;
  signal?: AbortSignal;
};

export type RequestWithBodyModel = RequestModel & {
  body?: object | FormData;
};

const readResponse = async (response: Response) => {
  if (!response.headers) {
    console.log();
    return response;
  }
  console.log(response.status, [...response.headers.keys()]);
  const contentType = response.headers.get('content-type');
  const contentDisposition = response.headers.get('content-disposition');

  if (contentType === null) {
    return null;
  } else if (contentType.indexOf('application/json') !== -1) {
    return await response.json();
  } else if (contentType.indexOf('text/plain') !== -1) {
    return await response.text();
  } else if (contentDisposition != null && contentDisposition.indexOf('attachment') !== -1) {
    return await response.blob();
  } else {
    return null;
  }
};

export const useFetch = () => {
  const handleFetch = async (
    url: string,
    request: any,
    signal?: AbortSignal,
  ) => {
    const apiPrefix = getApiUrl();
    const apiUrl = `${apiPrefix}${url}`;
    const requestUrl = request?.params ? `${apiUrl}${request.params}` : apiUrl;

    const requestBody = request?.body
      ? request.body instanceof FormData
        ? { ...request, body: request.body }
        : { ...request, body: JSON.stringify(request.body) }
      : request;

    const headers = {
      ...(request?.headers
        ? request.headers
        : request?.body && request.body instanceof FormData
        ? {}
        : { 'Content-type': 'application/json' }),
    };

    return fetch(requestUrl, {
      ...requestBody,
      headers: { ...headers, Authorization: `Bearer ${getUserSession()}` },
      signal,
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 401) {
            location.href = getLoginUrl();
          }
          throw response;
        }

        const result = readResponse(response);
        return result;
      })
      .catch(async (err) => {
        const error = await readResponse(err);
        const message = error?.message || error.errMessage || error;
        const { t } = useTranslation();
        toast.error(
          t(
            typeof message === 'string'
              ? message
              : 'Operation failed, Please try again later, or contact technical personnel',
          ),
        );
        throw error;
      });
  };

  return {
    get: async <T>(url: string, request?: RequestModel): Promise<T> => {
      return handleFetch(url, { ...request, method: 'get' });
    },
    post: async <T>(
      url: string,
      request?: RequestWithBodyModel,
    ): Promise<T> => {
      return handleFetch(url, { ...request, method: 'post' });
    },
    put: async <T>(url: string, request?: RequestWithBodyModel): Promise<T> => {
      return handleFetch(url, { ...request, method: 'put' });
    },
    patch: async <T>(
      url: string,
      request?: RequestWithBodyModel,
    ): Promise<T> => {
      return handleFetch(url, { ...request, method: 'patch' });
    },
    delete: async <T>(url: string, request?: RequestModel): Promise<T> => {
      return handleFetch(url, { ...request, method: 'delete' });
    },
  };
};
