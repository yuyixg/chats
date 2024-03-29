import { FileServerType } from '@/types/file';

export function getFileConfigs(type: FileServerType) {
  return FileDefaultTemplates[type] as any;
}

export const FileDefaultTemplates = {
  [FileServerType.Local]: {
    storageFolderName: '',
  },
  [FileServerType.Minio]: {
    accessKey: '',
    accessSecret: '',
    endpoint: '',
    bucketName: '',
  },
  [FileServerType.Aws]: {
    accessKey: '',
    accessSecret: '',
    region: '',
    bucketName: '',
  },
  [FileServerType.Azure]: {},
  [FileServerType.Aliyun]: {},
};
