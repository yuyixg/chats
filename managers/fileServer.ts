import { FileServers } from '@/db';
import {
  FileServerType,
  IFileConfig,
  PostFileServerParams,
  PutFileServerParams,
} from '@/types/file';
import AWS from 'aws-sdk';
import fs from 'fs';

export class FileServerManager {
  static async findById(id: string) {
    return await FileServers.findByPk(id);
  }

  static async findByName(name: string) {
    return await FileServers.findOne({ where: { name } });
  }

  static async createFileServer(params: PostFileServerParams) {
    return await FileServers.create(params);
  }

  static async findFileServers(findAll: boolean = true) {
    const where = { enabled: true };
    return await FileServers.findAll({
      where: findAll ? {} : where,
      order: [['createdAt', 'DESC']],
    });
  }

  static async updateFileServer(params: PutFileServerParams) {
    return await FileServers.update(params, {
      where: {
        id: params.id,
      },
    });
  }

  static async initFileServer(type: FileServerType, configs: IFileConfig) {
    const { storageFolderName, accessKey, accessSecret, region, bucketName } =
      configs;
    if (type === FileServerType.Local && storageFolderName) {
      const isExisted = await fs.existsSync('public/' + storageFolderName);
      if (!isExisted) {
        await fs.mkdirSync('public/' + storageFolderName);
      }
    } else if (
      type === FileServerType.Aws &&
      accessKey &&
      accessSecret &&
      region &&
      bucketName
    ) {
      const s3 = new AWS.S3({
        accessKeyId: accessKey,
        secretAccessKey: accessSecret,
        region: region,
      });
      s3.putBucketCors(
        {
          Bucket: bucketName,
          CORSConfiguration: {
            CORSRules: [
              {
                AllowedOrigins: ['*'],
                AllowedMethods: ['GET', 'POST', 'PUT'],
                AllowedHeaders: ['*'],
              },
            ],
          },
        },
        (error) => {
          if (error) {
            console.error('Aws configuration error', JSON.stringify(error));
          }
        }
      );
    }
  }
}
