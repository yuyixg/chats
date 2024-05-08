import { FileServicesType } from '@/types/file';
import { Model, ModelProviders, ModelType } from '@/types/model';

export const getModelEndpoint = (modelProvider: ModelProviders) => {
  const Endpoints = {
    [ModelProviders.Azure]: 'api/models/openai',
    [ModelProviders.OpenAI]: 'api/models/openai',
    [ModelProviders.QianFan]: 'api/models/qianfan',
    [ModelProviders.QianWen]: 'api/models/qianwen',
    [ModelProviders.Spark]: 'api/models/spark',
    [ModelProviders.LingYi]: 'api/models/lingyi',
    [ModelProviders.Moonshot]: 'api/models/kimi',
  };
  return Endpoints[modelProvider];
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
