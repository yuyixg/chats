import { SiteInfo } from '@/types/config';

export const setSiteInfo = (info: SiteInfo) => {
  localStorage.setItem('siteInfo', JSON.stringify(info));
};

export const getSiteInfo = (): SiteInfo => {
  const siteInfo = localStorage.getItem('siteInfo') || '{}';
  return JSON.parse(siteInfo);
};

export const hasContact = (siteInfo?: SiteInfo) => {
  let contact = {} as any;
  if (siteInfo) {
    contact = siteInfo.contact;
  } else {
    contact = getSiteInfo().contact;
  }
  return !!contact?.qqGroupNumber;
};
