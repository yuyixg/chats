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
