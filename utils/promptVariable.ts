export const PromptVariables = {
  '${currentDate}': () => new Date().toLocaleDateString().replaceAll('/', '-'),
  '${currentTime}': () => new Date().toLocaleString().replaceAll('/', '-'),
};

export function formatPrompt(prompt: string) {
  Object.keys(PromptVariables).forEach((k) => {
    const key = k as keyof typeof PromptVariables;
    prompt = prompt?.replaceAll(key, PromptVariables[key]());
  });
  return prompt;
}
