import { ChatsApiRequest } from '@/types/next-api';

import { UsersManager } from '@/managers';
import { apiHandler } from '@/middleware/api-handler';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 5,
};

const handler = async (req: ChatsApiRequest) => {
  if (req.method === 'GET') {
    return await UsersManager.getUserInitialConfig();
  } else if (req.method === 'PUT') {
    const { id, models, price, enabled } = req.body;
    const _models = models.map((x: any) => {
      return {
        modelId: x.modelId,
        enabled: x.enabled,
        tokens: x.tokens,
        counts: x.counts,
        expires: x.expires,
      };
    });
    const data = await UsersManager.updateUserInitialConfig({
      id,
      models: _models,
      price,
      enabled,
    });
    return data;
  }
};

export default apiHandler(handler);
