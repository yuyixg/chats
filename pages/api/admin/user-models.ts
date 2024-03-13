import type { NextApiRequest, NextApiResponse } from 'next';
import { ChatModelManager, UserModelManager } from '@/managers';
import { UserRole } from '@/types/admin';
import { getSession } from '@/utils/session';
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
      const { userModelId, models } = req.body;
      const data = await UserModelManager.updateUserModel(userModelId, models);
      return res.status(200).send(data);
    } else {
      const { query } = req.body;
      const userModels = await UserModelManager.findUsersModel(query);
      const models = await ChatModelManager.findModels(true);
      const data = userModels.map((x) => {
        return {
          userId: x.userId,
          userModelId: x.id,
          role: x.User.role,
          userName: x.User.username,
          models: x.models.map((item) => {
            const model = models.find((model) => model.id === item.modelId)!;
            return {
              modelVersion: model.modelVersion,
              modelName: model.name,
              ...item,
            };
          }),
        };
      });
      return res.status(200).json(data);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).end();
  }
};

export default handler;
