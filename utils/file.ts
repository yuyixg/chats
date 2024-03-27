import { FileServerType } from '@/types/file';

export function getFileConfigs(type: FileServerType) {
  return FileDefaultTemplates[type] as any;
}

export const FileDefaultTemplates = {
  [FileServerType.Local]: {},
  [FileServerType.Minio]: {
    accessKey: '',
    accessSecret: '',
    endpoint: '',
    bucketName: '',
  },
  [FileServerType.Aws]: {},
  [FileServerType.Azure]: {},
  [FileServerType.Aliyun]: {},
};
