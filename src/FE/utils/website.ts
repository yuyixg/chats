import { SiteInfoConfig } from '@/types/config';

export const setSiteInfo = (info: SiteInfoConfig) => {
  localStorage.setItem('siteInfo', JSON.stringify(info || {}));
};

export const getSiteInfo = (): SiteInfoConfig => {
  const siteInfo = localStorage.getItem('siteInfo') || '{}';
  return JSON.parse(siteInfo);
};

export const hasContact = (siteInfo?: SiteInfoConfig) => {
  let contact = {} as any;
  if (siteInfo) {
    contact = siteInfo?.contact;
  } else {
    contact = getSiteInfo()?.contact;
  }
  return !!contact?.qqGroupNumber;
};
