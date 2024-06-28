export enum GlobalConfigKeys {
  tencentSms = 'tencentSms',
  session = 'session',
  siteInfo = 'siteInfo',
}

export interface TencentSmsConfig {
  secretId: string;
  secretKey: string;
  sdkAppId: string;
  signName: string;
  templateId: string;
}

export interface SessionConfig {}

export interface SiteInfo {
  filingNumber: string;
  contact: {
    qqGroupNumber: string;
  };
}

export const GlobalConfigs = {
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
};
