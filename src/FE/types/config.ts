export enum GlobalConfigKeys {
  tencentSms = 'tencentSms',
  session = 'session',
  siteInfo = 'siteInfo',
  logs = 'logs',
}

export interface TencentSmsConfig {
  secretId: string;
  secretKey: string;
  sdkAppId: string;
  signName: string;
  templateId: string;
}

export interface SessionConfig {}

export interface SiteInfoConfig {
  filingNumber: string;
  contact: {
    qqGroupNumber: string;
    qqGroupQrCodeLink: string;
  };
}

export interface LogsConfig {
  error: boolean;
  success: boolean;
}

export const GlobalDefaultConfigs = {
  tencentSms: {
    secretId: '',
    secretKey: '',
    sdkAppId: '',
    signName: '',
    templateId: '',
  },
  siteInfo: {
    filingNumber: '',
    contact: {
      qqGroup: '',
    },
  },
  session: {
    expire: '',
  },
  logs: {
    error: true,
    success: false,
  },
};
