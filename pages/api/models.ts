import type { NextApiRequest, NextApiResponse } from 'next';
import { ChatModelManager, UserModelManager } from '@/managers';
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
  try {
    const session = await getSession(req.cookies);
    if (!session) {
      return res.status(401).end();
    }
    const userModels = await UserModelManager.findEnableModels(session.userId!);
    const models = await ChatModelManager.findEnableModels();
    const _models = models
      .filter((m) => userModels.includes(m.id))
      .map((x) => {
        return {
          modelId: x.id,
          name: x.name,
          type: x.type,
          systemPrompt: x.modelConfig?.prompt,
          maxLength: x.modelConfig?.maxLength,
          tokenLimit: x.modelConfig?.tokenLimit,
          imgConfig: x.imgConfig,
        };
      });
    return res.status(200).json(_models);
  } catch (error) {
    console.error(error);
    return res.status(500).end();
  }
};

export default handler;
