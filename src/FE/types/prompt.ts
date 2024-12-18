export interface Prompt extends IdName {
  content: string;
  isDefault: boolean;
  temperature: number | null;
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
