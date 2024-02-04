import type { NextApiRequest, NextApiResponse } from 'next';
import { UserModelManager } from '@/managers';
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 5,
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === 'PUT') {
      const { userModelId, models } = req.body;
      const data = await UserModelManager.updateUserModel(userModelId, models);
      return res.status(200).send(data);
    } else {
      const userModels = await UserModelManager.findUsersModel();
      const data = userModels.map((x) => {
        return {
          userId: x.userId,
          userModelId: x.id,
          role: x.User.role,
          userName: x.User.userName,
          models: x.models,
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
