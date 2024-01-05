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
  if (modeName?.includes('SPARK'))
    return 'Your name is iFLYTEK Spark Cognitive Model, Please follow the instructions of users carefully, Respond in Markdown format.';
  else if (modeName?.includes('GPT')) {
    return "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown.";
  } else if (modeName?.includes('ERNIE-Bot')) {
    return "You are a virtual language chat model. Please carefully follow the user's instructions. Use markdown to respond.";
  }
};
