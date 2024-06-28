import { ChatsApiRequest } from '@/types/next-api';

import { LoginServiceManager } from '@/managers/loginService';
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
  if (req.method === 'GET') {
    const loginTypes = await LoginServiceManager.findAllEnabled();
    return loginTypes.map((x) => {
      const configs = JSON.parse(x?.configs || '{}');
      return {
        type: x.type,
        configs: {
          appId: configs?.appId,
        },
      };
    });
  }
}

export default apiHandler(handler);
