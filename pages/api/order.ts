import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@/utils/session';
import { internalServerError, unauthorized } from '@/utils/error';
import requestIp from 'request-ip';
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
    const session = await getSession(req.cookies);
    if (!session) {
      return unauthorized(res);
    }
    if (req.method === 'POST') {
    }
  } catch (error) {
    console.error(error);
    return internalServerError(res);
  }
};

export default handler;
