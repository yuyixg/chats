import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { ChatModelManager, UserModelManager } from '@/managers';
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
    const { userId } = req.body;
    const userModels = await UserModelManager.findUserModels(userId);
    const data = userModels.map((x) => {
      return {
        userId: x.userId,
        userModelId: x.id,
        expires: x.expires,
        counts: x.counts,
        enable: x.enable,
        modelId: x.ChatModel.id,
        userName: x.User.userName,
      };
    });
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).end();
  }
};

export default handler;
