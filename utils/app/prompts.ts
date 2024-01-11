import { Prompt } from '@/types/prompt';

export const updatePrompt = (updatedPrompt: Prompt, allPrompts: Prompt[]) => {
  const updatedPrompts = allPrompts.map((c) => {
    if (c.id === updatedPrompt.id) {
      return updatedPrompt;
    }

    return c;
  });

  savePrompts(updatedPrompts);

  return {
    single: updatedPrompt,
    all: updatedPrompts,
  };
};

export const savePrompts = (prompts: Prompt[]) => {
  localStorage.setItem('prompts', JSON.stringify(prompts));
};

export const getDefaultPrompt = (modeName?: string) => {
  if (modeName === 'GPT-4-VISION') {
      return "你是具有图片理解能力的AI助理，请仔细遵循用户指令，使用markdown回复";
  } else {
    return "你是AI助理，请仔细遵循用户指令，使用markdown回复";
  }
};
