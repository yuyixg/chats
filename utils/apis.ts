import { FileServerType } from '@/types/file';
import { Model, ModelType } from '@/types/model';

export const getModelEndpoint = (model: Model) => {
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

export const getFileEndpoint = (file: FileServerType) => {
  const Endpoints = {
    [FileServerType.Local]: 'api/files/local',
    [FileServerType.Minio]: 'api/files/minio',
    [FileServerType.Aws]: 'api/files/aws',
    [FileServerType.Azure]: 'api/files/azure',
    [FileServerType.Aliyun]: 'api/files/aliyun',
  };
  return Endpoints[file];
};
