import type { NextApiRequest, NextApiResponse } from 'next';
import { ChatModelManager, UserModelManager } from '@/managers';
import { getSession } from '@/utils/session';
import { internalServerError, unauthorized } from '@/utils/error';
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
      return unauthorized(res);
    }
    const userModels = await UserModelManager.findEnableModels(session.userId!);
    const models = await ChatModelManager.findModels();
    const _models = models
      .filter((m) => userModels.includes(m.id!))
      .map((x) => {
        return {
          id: x.id,
          modelVersion: x.modelVersion,
          name: x.name,
          type: x.type,
          systemPrompt: x.modelConfig?.prompt,
          maxLength: x.modelConfig?.maxLength,
          tokenLimit: x.modelConfig?.tokenLimit,
          fileConfig: x.fileConfig,
        };
      });
    return res.json(_models);
  } catch (error) {
    console.error(error);
    return internalServerError(res);
  }
};

export default handler;
