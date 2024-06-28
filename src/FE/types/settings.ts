export const Themes = ['light', 'dark'];

export const Languages = ['zh', 'en'];

export const DEFAULT_LANGUAGE = 'zh';
export const DEFAULT_THEME = 'light';

export interface Settings {
  language: (typeof Languages)[number];
}
