export enum ProviderType {
  'KeyCloak' = 'KeyCloak',
  'WeChat' = 'WeChat',
}

export interface SingInParams {
  username?: string;
  password?: string;
  code?: string;
}

export interface SingInResult {
  sessionId: string;
  username: string;
  role: string;
  canRecharge: boolean;
}

export interface ProviderResult {
  type: ProviderType;
  configs: {
    appId: string;
  };
}
