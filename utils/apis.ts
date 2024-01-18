import { Model, ModelType } from '@/types/model';

export const getEndpoint = (model: Model) => {
  const Endpoints = {
    [ModelType.GPT]: 'api/openai',
    [ModelType.QianFan]: 'api/qianfan',
    [ModelType.QianWen]: 'api/qianwen',
    [ModelType.Spark]: 'api/spark',
  };
  return Endpoints[model.type];
};
