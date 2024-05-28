import { FileServicesType } from '@/types/file';

export function getFileConfigs(type: FileServicesType) {
  return FileDefaultTemplates[type] as any;
}

export const FileDefaultTemplates = {
  [FileServicesType.Local]: {
    storageFolderName: '',
  },
  [FileServicesType.Minio]: {
    accessKey: '',
    accessSecret: '',
    endpoint: '',
    bucketName: '',
  },
  [FileServicesType.Aws]: {
    accessKey: '',
    accessSecret: '',
    region: '',
    bucketName: '',
  },
  [FileServicesType.Azure]: {},
  [FileServicesType.Aliyun]: {},
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
