import type { NextApiRequest, NextApiResponse } from 'next';
import { UserRole } from '@/types/admin';
import { getSession } from '@/utils/session';
import { InternalServerError } from '@/utils/error';
import { UserBalancesManager } from '@/managers';
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
      const data = await UserBalancesManager.updateBalance(
        userId,
        value,
        session.userId
      );
      return data;
    } else if (req.method === 'GET') {
    }
  } catch (error: any) {
    throw new InternalServerError(
      JSON.stringify({ message: error?.message, stack: error?.stack })
    );
  }
};

export default apiHandler(handler);
