import { ChatsApiRequest, ChatsApiResponse } from '@/types/next-api';

import { UserModelManager } from '@/managers';
import { apiHandler } from '@/middleware/api-handler';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 5,
};

async function handler(req: ChatsApiRequest) {
  const { userId } = req.session;
  if (req.method === 'GET') {
    const { modelId } = req.query as { modelId: string };
    const data = await UserModelManager.findUserModelUsage(userId, modelId);
    return {
      counts: data?.counts,
      tokens: data?.tokens,
      expires: data?.expires,
    };
  }
}

export default apiHandler(handler);
