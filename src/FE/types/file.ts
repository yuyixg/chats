export type FileServiceType = {
  id: number;
  name: string;
};

export const fileServiceTypes: FileServiceType[] = [
  { id: 0, name: 'Local' },
  { id: 1, name: 'Minio' },
  { id: 2, name: 'AWS S3' },
  { id: 3, name: 'Aliyun OSS' },
  { id: 4, name: 'Azure Blob Storage' }
];

export enum FileServiceTypes {
  Local = 0,
  Minio = 1,
  AWSS3 = 2,
  AliyunOSS = 3,
  AzureBlobStorage = 4
}