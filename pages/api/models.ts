import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
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
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).end();
    }
    const userModels = await UserModelManager.findEnableModels(session.userId);
    const models = await ChatModelManager.findEnableModels();
    const _models = models
      .filter((m) => userModels.includes(m.id))
      .map((x) => {
        return {
          modelId: x.id,
          name: x.name,
          type: x.type,
          systemPrompt: x.systemPrompt,
          maxLength: x.maxLength,
          tokenLimit: x.tokenLimit,
          fileSizeLimit: x.fileSizeLimit,
        };
      });
    return res.status(200).json(_models);
  } catch (error) {
    console.error(error);
    return res.status(500).end();
  }
};

export default handler;
