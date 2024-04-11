import { NextApiRequest } from 'next';
import * as AWS from 'aws-sdk';
import { getSession } from '@/utils/session';
import { BadRequest, InternalServerError, Unauthorized } from '@/utils/error';
import { FileServiceManager } from '@/managers';
import { apiHandler } from '@/middleware/api-handler';

const handler = async (req: NextApiRequest, res: any) => {
  try {
    const session = await getSession(req.cookies);
    if (!session) {
      throw new Unauthorized();
    }
    const { id } = req.query as { id: string };
    const fileServer = await FileServiceManager.findById(id);
    if (!fileServer || !fileServer.enabled) {
      throw new BadRequest('Not found File Server');
    }

    const {
      configs: { accessKey, accessSecret, region, bucketName },
    } = fileServer;

    const { fileName, fileType } = JSON.parse(req.body) as {
      fileName: string;
      fileType: string;
    };
    const s3 = new AWS.S3({
      accessKeyId: accessKey,
      secretAccessKey: accessSecret,
      region: region,
    });

    const date = new Date();
    const key = `${date.getFullYear()}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;

    const params = {
      Bucket: bucketName,
      Key: `${key}/${fileName}.${fileType}`,
      Expires: 60 * 60 * 24,
    };

    const putUrl = await s3.getSignedUrlPromise('putObject', params);
    const getUrl = await s3.getSignedUrlPromise('getObject', params);
    return { putUrl, getUrl };
  } catch (error: any) {
    throw new InternalServerError(
      JSON.stringify({ message: error?.message, stack: error?.stack })
    );
  }
};

export default apiHandler(handler);
