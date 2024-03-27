export enum FileServerType {
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
}

export interface PostFileServerParams {
  type: FileServerType;
  name: string;
  enabled: boolean;
  configs: IFileConfig;
}

export interface PutFileServerParams extends PostFileServerParams {
  id: string;
}
