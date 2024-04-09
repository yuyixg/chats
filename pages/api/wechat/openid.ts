import { NextApiRequest, NextApiResponse } from 'next';
import { internalServerError } from '@/utils/error';
import { weChatAuth } from '@/utils/weChat';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 5,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      const { code } = req.query as { code: string };
      const result = await weChatAuth(code);
      return res.send(result?.openid);
    }
  } catch (error: any) {
    return internalServerError(res);
  }
}
