import type { NextApiRequest, NextApiResponse } from 'next';
import {
  ChatModelManager,
  FileServerManager,
  UserModelManager,
} from '@/managers';
import { getSession } from '@/utils/session';
import { internalServerError, unauthorized } from '@/utils/error';
import { ChatModels, FileServers } from '@prisma/client';
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
    const userModels = await UserModelManager.findUserEnableModels(
      session.userId!
    );
    const models = await ChatModelManager.findModels();
    const fileServers = await FileServerManager.findFileServers(false);
    const _models = models
      .filter((m: ChatModels) => userModels.includes(m.id!))
      .map((x: ChatModels) => {
        const fileServer = fileServers.find(
          (f: FileServers) => f.id === x.fileServerId
        );
        return {
          id: x.id,
          modelVersion: x.modelVersion,
          name: x.name,
          type: x.type,
          // systemPrompt: x.modelConfig?.prompt,
          // maxLength: x.modelConfig?.maxLength,
          // tokenLimit: x.modelConfig?.tokenLimit,
          fileConfig: x.fileConfig,
          fileServerConfig: fileServer
            ? {
                id: fileServer?.id,
                type: fileServer?.type,
              }
            : null,
        };
      });
    return res.json(_models);
  } catch (error) {
    console.error(error);
    return internalServerError(res);
  }
};

export default handler;
