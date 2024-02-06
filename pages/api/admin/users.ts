import type { NextApiRequest, NextApiResponse } from 'next';
import { UserModelManager } from '@/managers';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { UserRole } from '@/types/admin';
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 5,
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).end();
    return;
  }
  const { role } = session;
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
