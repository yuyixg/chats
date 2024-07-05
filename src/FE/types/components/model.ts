export interface IModelConfig {
  prompt: string;
  temperature?: number;
}

export interface ISelectModel {
  id: string;
  name: string;
  config: IModelConfig;
}
