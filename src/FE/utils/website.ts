import { SiteInfoConfig } from '@/types/config';

export const setSiteInfo = (info: SiteInfoConfig) => {
  localStorage.setItem('siteInfo', JSON.stringify(info || {}));
};

export const getSiteInfo = (): SiteInfoConfig => {
  const siteInfo = localStorage.getItem('siteInfo') || '{}';
  return JSON.parse(siteInfo);
};

export const redirectToGithub = () => {
  window.open('https://github.com/sdcb/chats', '_blank');
};
