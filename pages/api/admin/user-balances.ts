import type { NextApiRequest, NextApiResponse } from 'next';
import { UserRole } from '@/types/admin';
import { getSession } from '@/utils/session';
import { internalServerError } from '@/utils/error';
import { UserBalancesManager } from '@/managers';
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 5,
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession(req.cookies);
  if (!session) {
    return res.status(401).end();
  }
  const role = session.role;
  if (role !== UserRole.admin) {
    res.status(401).end();
    return;
  }

  try {
    if (req.method === 'PUT') {
      const { userId, value } = req.body;
      await UserBalancesManager.updateBalance(userId, value, session.userId);
      return res.end();
    } else if (req.method === 'GET') {
    }
  } catch (error) {
    console.error(error);
    return internalServerError(res);
  }
};

export default handler;
