export enum GlobalConfigKeys {
  tencentSms = 'tencentSms',
  siteInfo = 'siteInfo',
  JwtSecretKey = 'JwtSecretKey',
}

export interface SiteInfoConfig {
  filingNumber: string;
  companyName: string;
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
  },
  JwtSecretKey: '',
};
