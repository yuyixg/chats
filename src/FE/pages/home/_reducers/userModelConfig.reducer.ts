export type SetPromptType = string | null;
export type SetTemperatureType = number | null;
export type SetEnableSearchType = boolean | null;
export type SetUserModelConfigType = {
  prompt: SetPromptType;
  temperature: SetTemperatureType;
  enableSearch: SetEnableSearchType;
};

interface UserModelConfigState {
  prompt?: SetPromptType;
  temperature?: SetTemperatureType;
  enableSearch?: SetEnableSearchType;
}

export const userModelConfigInitialState: UserModelConfigState = {
  prompt: null,
  temperature: null,
  enableSearch: null,
};

export enum UserModelConfigActionTypes {
  SET_PROMPT = 'SET_PROMPT',
  SET_TEMPERATURE = 'SET_TEMPERATURE',
  SET_ENABLE_SEARCH = 'SET_ENABLE_SEARCH',
  SET_USER_MODEL_CONFIG = 'SET_USER_MODEL_CONFIG',
}

export type UserModelConfigAction =
  | { type: UserModelConfigActionTypes.SET_PROMPT; payload: SetPromptType }
  | {
      type: UserModelConfigActionTypes.SET_TEMPERATURE;
      payload: SetTemperatureType;
    }
  | {
      type: UserModelConfigActionTypes.SET_ENABLE_SEARCH;
      payload: SetEnableSearchType;
    }
  | {
      type: UserModelConfigActionTypes.SET_USER_MODEL_CONFIG;
      payload: SetUserModelConfigType;
    };

export default function userModelConfigReducer(
  state: UserModelConfigState = userModelConfigInitialState,
  action: UserModelConfigAction,
): UserModelConfigState {
  switch (action.type) {
    case UserModelConfigActionTypes.SET_PROMPT:
      return { ...state, prompt: action.payload };
    case UserModelConfigActionTypes.SET_TEMPERATURE:
      return { ...state, temperature: action.payload };
    case UserModelConfigActionTypes.SET_ENABLE_SEARCH:
      return { ...state, enableSearch: action.payload };
    case UserModelConfigActionTypes.SET_USER_MODEL_CONFIG:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
