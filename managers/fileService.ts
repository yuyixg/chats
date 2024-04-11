import prisma from '@/db/prisma';
import {
  FileServicesType,
  IFileConfig,
  PostFileServicesParams,
  PutFileServicesParams,
} from '@/types/file';
import AWS from 'aws-sdk';
import fs from 'fs';

export class FileServiceManager {
  static async findById(id: string) {
    const fileServer = await prisma.fileServices.findUnique({ where: { id } });
    return {
      ...fileServer,
      configs: JSON.parse(fileServer?.configs || '{}'),
    };
  }

  static async findByName(name: string) {
    return await prisma.fileServices.findFirst({ where: { name } });
  }

  static async createFileServices(params: PostFileServicesParams) {
    return await prisma.fileServices.create({ data: { ...params } });
  }

  static async findFileServices(findAll: boolean = true) {
    const where = { enabled: true };
    return await prisma.fileServices.findMany({
      where: findAll ? {} : where,
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updateFileServices(params: PutFileServicesParams) {
    return await prisma.fileServices.update({
      where: { id: params.id },
      data: { ...params },
    });
  }

  static async initFileServer(type: FileServicesType, configs: IFileConfig) {
    const { storageFolderName, accessKey, accessSecret, region, bucketName } =
      configs;
    if (type === FileServicesType.Local && storageFolderName) {
      const isExisted = await fs.existsSync('public/' + storageFolderName);
      if (!isExisted) {
        await fs.mkdirSync('public/' + storageFolderName);
      }
    } else if (
      type === FileServicesType.Aws &&
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
