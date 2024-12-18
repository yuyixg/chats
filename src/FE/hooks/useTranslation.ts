import { DEFAULT_LANGUAGE, getLanguage } from '@/utils/language';

import zhCN from '../locales/zh-CN.json';

const useTranslation = () => {
  function t(message: string, params = {}) {
    const defaultLanguageJSON = zhCN;
    const language = getLanguage();
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
