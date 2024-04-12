import { InternalServerError } from '@/utils/error';
import { UserBalancesManager } from '@/managers';
import { apiHandler } from '@/middleware/api-handler';
import { ChatsApiRequest, ChatsApiResponse } from '@/types/next-api';
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 5,
};

const handler = async (req: ChatsApiRequest, res: ChatsApiResponse) => {
  try {
    if (req.method === 'PUT') {
      const { userId, value } = req.body;
      const data = await UserBalancesManager.updateBalance(
        userId,
        value,
        req.session.userId
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
