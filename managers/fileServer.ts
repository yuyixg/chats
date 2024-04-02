import prisma from '@/db/prisma';
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
    const fileServer = await prisma.fileServers.findUnique({ where: { id } });
    return {
      ...fileServer,
      configs: JSON.parse(fileServer?.configs || '{}'),
    };
  }

  static async findByName(name: string) {
    return await prisma.fileServers.findFirst({ where: { name } });
  }

  static async createFileServer(params: PostFileServerParams) {
    return await prisma.fileServers.create({ data: { ...params } });
  }

  static async findFileServers(findAll: boolean = true) {
    const where = { enabled: true };
    return await prisma.fileServers.findMany({
      where: findAll ? {} : where,
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updateFileServer(params: PutFileServerParams) {
    return await prisma.fileServers.update({
      where: { id: params.id },
      data: { ...params },
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
