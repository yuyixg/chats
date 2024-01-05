import { Model } from "./model";

export interface Prompt {
  id: string;
  name: string;
  description: string;
  content: string;
  model: Model;
}
