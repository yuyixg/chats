import { SiteInfo } from '@/types/config';

export const setSiteInfo = (info: SiteInfo) => {
  localStorage.setItem('siteInfo', JSON.stringify(info));
};

export const getSiteInfo = (): SiteInfo => {
  const siteInfo = localStorage.getItem('siteInfo') || '{}';
  return JSON.parse(siteInfo);
};

export const hasContact = () => {
  const contact = getSiteInfo().contact;
  return !!contact?.qqGroupNumber;
};
