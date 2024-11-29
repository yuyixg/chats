import { PayServiceType } from '@/types/pay';

export function getPayConfigs(type: PayServiceType) {
  return PayDefaultTemplates[type] as any;
}

export const PayDefaultTemplates = {
  [PayServiceType.WeChatPay]: {
    appId: '',
    secret: '',
    mchId: '',
    apiV3Key: '',
    apiClientCert: '',
    apiClientKey: '',
  },
};
