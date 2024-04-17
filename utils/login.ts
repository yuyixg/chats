import { ProviderType } from '@/types/user';

export function getLoginConfigs(type: ProviderType) {
  return LoginDefaultTemplates[type] as any;
}

export const LoginDefaultTemplates = {
  [ProviderType.KeyCloak]: {
    wellKnown: '',
    clientId: '',
    secret: '',
  },
  [ProviderType.WeChat]: {
    appId: '',
    secret: '',
  },
};

export interface LoginTemplateAllProperty {
  appId: string;
  secret: string;
  wellKnown: string;
  clientId: string;
}
