import { AdminModelDto } from "@/types/adminApis";

interface PromptParams {
  model: AdminModelDto;
}

export const PromptVariables = {
  '{{CURRENT_DATE}}': () => new Date().toLocaleDateString(),
  '{{CURRENT_TIME}}': () => new Date().toLocaleString(),
  '{{MODEL_NAME}}': (params?: PromptParams) => params?.model?.modelReferenceShortName || params?.model?.modelReferenceName || '',
};

export function formatPrompt(prompt: string, params?: PromptParams) {
  Object.keys(PromptVariables).forEach((k) => {
    const key = k as keyof typeof PromptVariables;
    prompt = prompt?.replaceAll(key, PromptVariables[key](params));
  });
  return prompt;
}
