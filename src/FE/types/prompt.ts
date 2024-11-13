export interface Prompt extends IdName {
  description: string;
  content: string;
}

export interface IdName {
  id: string;
  name: string;
}