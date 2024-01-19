// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest } from 'next';
import { MINIO_ACCESS_KEY, MINIO_BUCKET_NAME, MINIO_SECRET } from '@/utils/const';
import * as AWS from 'aws-sdk';

export default async function handler(req: NextApiRequest, res: any) {
  const { fileName, fileType } = JSON.parse(req.body) as {
    fileName: string;
    fileType: string;
  };
  const s3 = new AWS.S3({
    accessKeyId: MINIO_ACCESS_KEY,
    secretAccessKey: MINIO_SECRET,
    endpoint: 'https://io.starworks.cc:88',
    s3ForcePathStyle: true,
  });

  const date = new Date();
  const key = `${date.getFullYear()}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;

  const params = {
    Bucket: MINIO_BUCKET_NAME,
    Key: `${key}/${fileName}.${fileType}`,
    Expires: 60 * 60 * 24,
  };

  const putUrl = await s3.getSignedUrlPromise('putObject', params);
  const getUrl = await s3.getSignedUrlPromise('getObject', params);
  res.status(200).send({ putUrl, getUrl });
}
