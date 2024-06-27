import { Model } from '@/types/model';

interface PromptParams {
  model: Model;
}

export const PromptVariables = {
  '{{CURRENT_DATE}}': () => new Date().toLocaleDateString(),
  '{{CURRENT_TIME}}': () => new Date().toLocaleString(),
  '{{MODEL_NAME}}': (params?: PromptParams) => params?.model?.name || '',
};

export function formatPrompt(prompt: string, params?: PromptParams) {
  Object.keys(PromptVariables).forEach((k) => {
    const key = k as keyof typeof PromptVariables;
    prompt = prompt?.replaceAll(key, PromptVariables[key](params));
  });
  return prompt;
}
