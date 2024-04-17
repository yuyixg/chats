export enum ProviderType {
  'KeyCloak' = 'KeyCloak',
  'WeChat' = 'WeChat',
}

export interface SingInParams {
  username?: string;
  password?: string;
  code?: string;
}

export interface ProviderResult {
  type: ProviderType;
  configs: {
    appId: string;
  };
}
