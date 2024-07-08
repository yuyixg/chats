import { LoginType } from '@/types/user';

export function getLoginConfigs(type: LoginType) {
  return LoginDefaultTemplates[type] as any;
}

export const LoginDefaultTemplates = {
  [LoginType.Keycloak]: {
    wellKnown: '',
    clientId: '',
    secret: '',
  },
  [LoginType.WeChat]: {
    appId: '',
    secret: '',
  },
  [LoginType.Phone]: {},
};

export interface LoginTemplateAllProperty {
  appId: string;
  secret: string;
  wellKnown: string;
  clientId: string;
}
