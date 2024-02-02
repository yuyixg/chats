import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { ChatModelManager, UserManager, UserModelManager } from '@/managers';
import { GetUsersModelsResult } from '@/types/user';
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
    const users = await UserManager.findUsers();
    const userIds = users.map((x) => x.id!);
    const userModels = await UserModelManager.findUsersModel(userIds);
    const data = users.map((x) => {
      return {
        userId: x.id,
        userName: x.userName,
        role: x.role,
        models: userModels
          .filter((um) => um.userId === x.id)
          .map((m) => {
            return {
              modelId: m.modelId,
              enable: m.enable,
              tokens: m.tokens,
              counts: m.counts,
              expires: m.expires,
            };
          }),
      };
    });
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).end();
  }
};

export default handler;
