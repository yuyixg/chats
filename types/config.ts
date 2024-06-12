export enum GlobalConfigKeys {
  tencentSms = 'tencentSms',
  session = 'session',
}

export interface TencentSmsConfig {
  secretId: string;
  secretKey: string;
  sdkAppId: string;
  signName: string;
  templateId: string;
}

export interface SessionConfig {}

export const GlobalConfigs = {
  tencentSms: {
    secretId: '',
    secretKey: '',
    sdkAppId: '',
    signName: '',
    templateId: '',
  },
  session: {
    expire: '',
  },
};
