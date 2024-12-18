import {
  PromptAction,
  PromptActionTypes,
  SetPromptsType,
} from '../_reducers/prompt.reducer';

export const setPrompts = (prompts: SetPromptsType): PromptAction => ({
  type: PromptActionTypes.SET_PROMPTS,
  payload: prompts,
});

export default function () {}
