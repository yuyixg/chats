import { useFetch } from '@/hooks/useFetch';

export const callWxPay = (amount: number) => {
  const fetchService = useFetch();
  return fetchService.post('/api/payment/pay', {
    body: { amount },
  });
};
