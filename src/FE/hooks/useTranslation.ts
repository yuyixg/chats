import { DEFAULT_LANGUAGE, getSettingsLanguage } from '@/utils/settings';

import zhCN from '../locales/zh-CN.json';

const useTranslation = () => {
  function t(message: string, params = {}) {
    const defaultLanguageJSON = zhCN;
    const language = getSettingsLanguage();
    let msg =
      language === DEFAULT_LANGUAGE
        ? (defaultLanguageJSON as any)[message] || message
        : message;
    Object.keys(params).forEach((k) => {
      const key = k as keyof typeof params;
      msg = msg?.replaceAll(`{{${key}}}`, params[key]);
    });
    return msg;
  }
  return { t };
};

export default useTranslation;
