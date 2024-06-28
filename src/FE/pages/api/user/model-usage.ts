import { ModelPriceUnit } from '@/utils/model';

import { ChatModelPriceConfig } from '@/types/model';
import { ChatsApiRequest, ChatsApiResponse } from '@/types/next-api';

import { ChatModelManager, UserModelManager } from '@/managers';
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
    const models = await ChatModelManager.findModels(true);
    const model = models.find((x) => x.id === data?.modelId);
    const priceConfig = JSON.parse(
      model?.priceConfig || '{}',
    ) as ChatModelPriceConfig;
    return {
      counts: data?.counts,
      tokens: data?.tokens,
      expires: data?.expires,
      prices: `${(priceConfig.input * ModelPriceUnit).toFixed(2)}/${(
        priceConfig.out * ModelPriceUnit
      ).toFixed(2)}`,
    };
  }
}

export default apiHandler(handler);
