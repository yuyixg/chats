import {
  ChatModelManager,
  FileServiceManager,
  UserModelManager,
} from '@/managers';
import { ChatModels, FileServices } from '@prisma/client';
import { apiHandler } from '@/middleware/api-handler';
import { ChatsApiRequest } from '@/types/next-api';
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 5,
};

const handler = async (req: ChatsApiRequest) => {
  const { userId } = req.session;
  const userModels = await UserModelManager.findUserEnableModels(userId);
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
};

export default apiHandler(handler);
