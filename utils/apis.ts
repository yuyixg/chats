import { Model, ModelType } from '@/types/model';

export const getEndpoint = (model: Model) => {
  const Endpoints = {
    [ModelType.GPT]: 'api/models/openai',
    [ModelType.QianFan]: 'api/models/qianfan',
    [ModelType.QianWen]: 'api/models/qianwen',
    [ModelType.Spark]: 'api/models/spark',
    [ModelType.LingYi]: 'api/models/lingyi',
    [ModelType.Kimi]: 'api/models/kimi',
  };
  return Endpoints[model.type];
};
