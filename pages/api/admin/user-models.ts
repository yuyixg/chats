import type { NextApiRequest, NextApiResponse } from 'next';
import { ChatModelManager, UserModelManager } from '@/managers';
import { UserRole } from '@/types/admin';
import { getSession } from '@/utils/session';
import { internalServerError, modelUnauthorized } from '@/utils/error';
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
    if (req.method === 'GET') {
      const { query } = req.query as { query: string };
      const userModels = await UserModelManager.findUsersModel(query);
      const models = await ChatModelManager.findModels(true);
      const data = userModels.map((x) => {
        return {
          userId: x.userId,
          userModelId: x.id,
          role: x.User.role,
          userName: x.User.username,
          models: x.models
            .filter((x) => x.enabled)
            .map((item) => {
              const model = models.find((model) => model.id === item.modelId)!;
              return {
                modelVersion: model.modelVersion,
                modelName: model.name,
                ...item,
              };
            }),
        };
      });
      return res.json(data);
    } else if (req.method === 'PUT') {
      const { userModelId, models } = req.body;
      const data = await UserModelManager.updateUserModel(userModelId, models);
      return res.json(data);
    } else if (req.method === 'POST') {
      const { userModelIds, modelId } = req.body;
      const userModels = await UserModelManager.findUserModelByIds(
        userModelIds
      );
      const model = await ChatModelManager.findModelById(modelId);
      if (!model) {
        return modelUnauthorized(res);
      }
      userModels.map((um) => {
        const foundModel = um.models.find((m) => m.modelId === modelId);
        if (!foundModel) {
          um.models.push({
            modelId: modelId,
            enabled: true,
          });
        }
        return um;
      });

      for (const um of userModels) {
        await UserModelManager.updateUserModel(um.id!, um.models);
      }
      return res.end();
    }
  } catch (error) {
    console.error(error);
    return internalServerError(res);
  }
};

export default handler;
