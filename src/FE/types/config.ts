export enum GlobalConfigKeys {
  tencentSms = 'tencentSms',
  session = 'session',
  siteInfo = 'siteInfo',
  logs = 'logs',
}

export interface SiteInfoConfig {
  filingNumber: string;
  contact: {
    qqGroupNumber: string;
    qqGroupQrCodeLink: string;
  };
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
