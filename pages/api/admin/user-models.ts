import { ChatModelManager, UserModelManager } from '@/managers';
import { ModelUnauthorized } from '@/utils/error';
import { ChatModels, UserModels } from '@prisma/client';
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
  if (req.method === 'GET') {
    const { query } = req.query as { query: string };
    const userModels = await UserModelManager.findUsersModel(query);
    const chatModels = await ChatModelManager.findModels(true);
    const data = userModels.map((x: any) => {
      const models = JSON.parse(x.models || '[]') as any[];
      return {
        userId: x.userId,
        userModelId: x.id,
        role: x.user.role,
        userName: x.user.username,
        balance: x.user.userBalances?.balance,
        models: models
          .filter((x) => x.enabled)
          .map((item) => {
            const model = chatModels.find(
              (model: ChatModels) => model.id === item.modelId
            )!;
            return {
              modelName: model.name,
              ...item,
            };
          }),
      };
    });
    return data;
  } else if (req.method === 'PUT') {
    const { userModelId, models } = req.body;
    const _models = models.map((x: any) => {
      return {
        modelId: x.modelId,
        enabled: x.enabled,
        tokens: x.tokens,
        counts: x.counts,
        expires: x.expires,
      };
    });
    const data = await UserModelManager.updateUserModel(
      userModelId,
      JSON.stringify(_models)
    );
    return data;
  } else if (req.method === 'POST') {
    const { userModelIds, modelId } = req.body;
    const userModels = await UserModelManager.findUserModelByIds(userModelIds);
    const model = await ChatModelManager.findModelById(modelId);
    if (!model) {
      throw new ModelUnauthorized();
    }
    userModels.map((um: UserModels) => {
      const models = JSON.parse(um.models || '[]') as any[];
      const foundModel = models.find((m) => m.modelId === modelId);
      if (!foundModel) {
        models.push({
          modelId: modelId,
          enabled: true,
          tokens: '-',
          counts: '-',
          expires: '-',
        });
        um.models = JSON.stringify(models);
      }
      return um;
    });

    for (const um of userModels) {
      await UserModelManager.updateUserModel(um.id!, um.models);
    }
  }
};

export default apiHandler(handler);
