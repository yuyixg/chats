import { FileServicesType } from '@/types/file';
import { Model, ModelProviders, ModelType } from '@/types/model';

export const getModelEndpoint = (model: Model) => {
  const Endpoints = {
    [ModelProviders.Azure]: 'api/models/openai',
    [ModelProviders.OpenAI]: 'api/models/openai',
    [ModelType.QianFan]: 'api/models/qianfan',
    [ModelType.QianWen]: 'api/models/qianwen',
    [ModelType.Spark]: 'api/models/spark',
    [ModelType.LingYi]: 'api/models/lingyi',
    [ModelType.Moonshot]: 'api/models/kimi',
  };
  return Endpoints[model.modelProvider];
};

export const getFileEndpoint = (file: FileServicesType, serverId: string) => {
  const Endpoints = {
    [FileServicesType.Local]: 'api/files/local',
    [FileServicesType.Minio]: 'api/files/minio',
    [FileServicesType.Aws]: 'api/files/aws',
    [FileServicesType.Azure]: 'api/files/azure',
    [FileServicesType.Aliyun]: 'api/files/aliyun',
  };
  return Endpoints[file] + '?id=' + serverId;
};
