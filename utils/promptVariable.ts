export const PromptVariables = {
  '{{currentDate}}': () => new Date().toLocaleDateString(),
  '{{currentTime}}': () => new Date().toLocaleString(),
};

export function formatPrompt(prompt: string) {
  Object.keys(PromptVariables).forEach((k) => {
    const key = k as keyof typeof PromptVariables;
    prompt = prompt?.replaceAll(key, PromptVariables[key]());
  });
  return prompt;
}
