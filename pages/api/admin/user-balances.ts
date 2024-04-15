import { UserBalancesManager } from '@/managers';
import { apiHandler } from '@/middleware/api-handler';
import { ChatsApiRequest } from '@/types/next-api';
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 5,
};

const handler = async (req: ChatsApiRequest) => {
  if (req.method === 'PUT') {
    const { userId, value } = req.body;
    const data = await UserBalancesManager.updateBalance(
      userId,
      value,
      req.session.userId
    );
    return data;
  }
};

export default apiHandler(handler);
