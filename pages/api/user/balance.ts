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

async function handler(req: ChatsApiRequest, res: ChatsApiResponse) {
  const { userId } = req.session;
  if (req.method === 'GET') {
    const data = await UserBalancesManager.findUserBalanceAndLogs(userId);
    return {
      balance: data.balance,
      logs: data.balanceLogs.map((x) => {
        return { value: x.value, date: x.createdAt };
      }),
    };
  }
}

export default apiHandler(handler);
