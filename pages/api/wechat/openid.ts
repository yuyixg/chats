import { NextApiRequest, NextApiResponse } from 'next';
import { InternalServerError } from '@/utils/error';
import { weChatAuth } from '@/utils/weChat';
import { apiHandler } from '@/middleware/api-handler';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 5,
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === 'GET') {
      const { code } = req.query as { code: string };
      const result = await weChatAuth(code);
      return result?.openid;
    }
  } catch (error: any) {
    throw new InternalServerError(
      JSON.stringify({ message: error?.message, stack: error?.stack })
    );
  }
};

export default apiHandler(handler);
