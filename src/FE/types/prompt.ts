export interface Prompt {
  id: string;
  name: string;
  description: string;
  content: string;
}

export enum PromptType {
  Public = 1,
  Private = 2,
}
