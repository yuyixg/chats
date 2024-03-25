import { FileType } from '@/types/file';
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

export const getFileEndpoint = (file: FileType) => {
  const Endpoints = {
    [FileType.Local]: 'api/files/local',
    [FileType.Minio]: 'api/files/minio',
    [FileType.Aws]: 'api/files/aws',
    [FileType.Azure]: 'api/files/azure',
    [FileType.Aliyun]: 'api/files/aliyun',
  };
  return Endpoints[file];
};
