import { PromptSlim } from '@/types/prompt';

export type SetPromptsType = PromptSlim[];

interface PromptInitialState {
  prompts: SetPromptsType;
}

export const promptInitialState: PromptInitialState = {
  prompts: [],
};

export enum PromptActionTypes {
  SET_PROMPTS = 'SET_PROMPTS',
}

export type PromptAction = {
  type: PromptActionTypes.SET_PROMPTS;
  payload: SetPromptsType;
};

export default function promptReducer(
  state: PromptInitialState,
  action: PromptAction,
): PromptInitialState {
  switch (action.type) {
    case PromptActionTypes.SET_PROMPTS:
      return { ...state, prompts: action.payload };
    default:
      return state;
  }
}
