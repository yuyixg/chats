import { useFetch } from '@/hooks/useFetch';

export const callWxPay = (amount: number) => {
  const fetchService = useFetch();
  return fetchService.post('/api/payment/pay', {
    body: { amount },
  });
};

export const createWeChatPayment = (code: string, orderId: string) => {
  const fetchService = useFetch();
  return fetchService.post<{ prepay_id: string; h5_url: string }>(
    '/api/payment/create',
    {
      body: { code, orderId },
    }
  );
};

export const createOrder = (amount: number) => {
  const fetchService = useFetch();
  return fetchService.post<{ orderId: string }>('/api/order', {
    body: { amount },
  });
};
