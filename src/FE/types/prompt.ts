export interface Prompt extends IdName {
  description: string;
  content: string;
}

export interface IdName {
  id: string;
  name: string;
}

export enum PromptType {
  Public = 1,
  Private = 2,
}
