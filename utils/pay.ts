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

export interface LoginTemplateAllProperty {
  appId: string;
  secret: string;
  mchId: string;
  apiV3Key: string;
  apiClientCert: string;
  apiClientKey: string;
}
