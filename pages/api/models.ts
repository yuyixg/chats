import type { NextApiRequest, NextApiResponse } from 'next';
import {
  ChatModelManager,
  FileServiceManager,
  UserModelManager,
} from '@/managers';
import { getSession } from '@/utils/session';
import { InternalServerError, Unauthorized } from '@/utils/error';
import { ChatModels, FileServices } from '@prisma/client';
import { apiHandler } from '@/middleware/api-handler';
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
      throw new Unauthorized();
    }
    const userModels = await UserModelManager.findUserEnableModels(
      session.userId!
    );
    const models = await ChatModelManager.findModels();
    const fileServices = await FileServiceManager.findFileServices(false);
    const _models = models
      .filter((m: ChatModels) => userModels.includes(m.id!))
      .map((x: ChatModels) => {
        const fileServer = fileServices.find(
          (f: FileServices) => f.id === x.fileServerId
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
    return _models;
  } catch (error: any) {
    throw new InternalServerError(
      JSON.stringify({ message: error?.message, stack: error?.stack })
    );
  }
};

export default apiHandler(handler);
