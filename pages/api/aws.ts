// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest } from 'next';

import { AWS_ACCESS_KEY, AWS_BUCKET_NAME, AWS_SECRET } from '@/utils/app/const';

import * as AWS from 'aws-sdk';

export default async function handler(req: NextApiRequest, res: any) {
  const { fileName, fileType } = JSON.parse(req.body) as {
    fileName: string;
    fileType: string;
  };
  const s3 = new AWS.S3({
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET,
    endpoint: 'https://io.starworks.cc:88',
    s3ForcePathStyle: true,
  });

  const key = new Date().toLocaleDateString();

  const params = {
    Bucket: AWS_BUCKET_NAME,
    Key: `${key}/${fileName}.${fileType}`,
    Expires: 60 * 60 * 24,
  };

  const putUrl = await s3.getSignedUrlPromise('putObject', params);
  const getUrl = await s3.getSignedUrlPromise('getObject', params);
  res.status(200).send({ putUrl, getUrl });
}
