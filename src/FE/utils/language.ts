export const DEFAULT_LANGUAGE = 'zh-CN';

export const getLanguage = () => {
  if (typeof navigator !== 'undefined') {
    return navigator?.language || DEFAULT_LANGUAGE;
  }
};
