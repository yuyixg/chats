const STORAGE_KEY = 'settings';
export const Themes = ['light', 'dark'];
export const Languages = ['zh-CN', 'en'];
export const DEFAULT_LANGUAGE = 'zh-CN';
export const DEFAULT_THEME = 'light';

export interface Settings {
  language: (typeof Languages)[number];
  showChatBar: boolean;
  showPromptBar: boolean;
  showChatSettingBar: boolean;
}

export const DEFAULT_SETTINGS = {
  language: DEFAULT_LANGUAGE,
  showChatBar: true,
  showPromptBar: false,
  showChatSettingBar: false,
};

export const getSettings = (): Settings => {
  let settings = DEFAULT_SETTINGS;
  if (typeof localStorage === 'undefined') return settings;
  const settingsJson = localStorage.getItem(STORAGE_KEY);
  if (settingsJson) {
    let savedSettings = JSON.parse(settingsJson) as Settings;
    settings = Object.assign(settings, savedSettings);
  }
  return settings;
};

export const saveSettings = (value: Settings) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
};

export const getSettingsLanguage = () => {
  const language = getSettings().language;
  if (language) return language;
  else if (typeof navigator !== 'undefined') {
    return navigator?.language || DEFAULT_LANGUAGE;
  }
};
