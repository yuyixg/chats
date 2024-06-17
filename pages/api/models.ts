import { ChatModelConfig } from '@/types/model';
import { ChatsApiRequest } from '@/types/next-api';

import {
  ChatModelManager,
  FileServiceManager,
  UserModelManager,
} from '@/managers';
import { apiHandler } from '@/middleware/api-handler';
import { ChatModels, FileServices } from '@prisma/client';

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
    .filter((m: ChatModels) => userModels.find((um) => um.modelId === m.id))
    .map((x: ChatModels) => {
      const fileServer = fileServices.find(
        (f: FileServices) => f.id === x.fileServiceId,
      );
      const modelConfig = JSON.parse(x.modelConfig) as ChatModelConfig;
      const modelUsage = userModels.find((um) => um.modelId === x.id);
      return {
        id: x.id,
        modelVersion: x.modelVersion,
        name: x.name,
        modelProvider: x.modelProvider,
        modelUsage: {
          counts: modelUsage?.counts,
          expires: modelUsage?.expires,
          tokens: modelUsage?.tokens,
        },
        modelConfig: {
          prompt: modelConfig?.prompt,
          temperature: modelConfig?.temperature,
          maxLength: modelConfig?.maxLength,
          enableSearch: modelConfig?.enableSearch,
        },
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
