import {
  SetEnableSearchType,
  SetPromptType,
  SetTemperatureType,
  SetUserModelConfigType,
  UserModelConfigAction,
  UserModelConfigActionTypes,
} from '../_reducers/userModelConfig.reducer';

export const setPrompt = (prompt: SetPromptType): UserModelConfigAction => ({
  type: UserModelConfigActionTypes.SET_PROMPT,
  payload: prompt,
});

export const setTemperature = (
  temperature: SetTemperatureType,
): UserModelConfigAction => ({
  type: UserModelConfigActionTypes.SET_TEMPERATURE,
  payload: temperature,
});

export const setEnableSearch = (
  enableSearch: SetEnableSearchType,
): UserModelConfigAction => ({
  type: UserModelConfigActionTypes.SET_ENABLE_SEARCH,
  payload: enableSearch,
});

export const setUserModelConfig = (
  modelConfig: SetUserModelConfigType,
): UserModelConfigAction => ({
  type: UserModelConfigActionTypes.SET_USER_MODEL_CONFIG,
  payload: modelConfig,
});

export default function () {}
