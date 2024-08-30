export enum FileServicesType {
  Local = 'Local',
  Minio = 'Minio',
  Aws = 'Aws',
  Aliyun = 'Aliyun',
  Azure = 'Azure',
}

export interface IFileConfig {
  accessKey?: string;
  accessSecret?: string;
  endpoint?: string;
  bucketName?: string;
  region?: string;
  storageFolderName?: string;
}

export interface PostFileServicesParams {
  type: FileServicesType;
  name: string;
  enabled: boolean;
  configs: string;
}

export interface PutFileServicesParams extends PostFileServicesParams {
}
