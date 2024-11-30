export interface Prompt extends IdName {
  content: string;
  temperature: number | null;
  isDefault: boolean;
  isSystem: boolean;
}

export interface IdName {
  id: number;
  name: string;
}

export interface PromptSlim extends IdName {
  isDefault: boolean;
  isSystem: boolean;
}