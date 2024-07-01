const STORAGE_KEY = 'settings';
export const Themes = ['light', 'dark'];
export const Languages = ['zh', 'en'];
export const DEFAULT_LANGUAGE = 'zh';
export const DEFAULT_THEME = 'light';

export interface Settings {
  language: (typeof Languages)[number];
  showChatBar: boolean;
  showPromptBar: boolean;
}

export const DEFAULT_SETTINGS = {
  language: DEFAULT_LANGUAGE,
  showChatBar: true,
  showPromptBar: false,
};

export const getSettings = (): Settings => {
  let settings = DEFAULT_SETTINGS;
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
  return getSettings().language;
};
