import { FileServicesType } from '../file';

export type FileUploadServerConfig = {
  id: string;
  type: FileServicesType;
};

export enum UploadFailType {
  default = 1,
  size = 2,
}
