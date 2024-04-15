import { ChatMessageManager, FileServiceManager } from '@/managers';
import { BadRequest } from '@/utils/error';
import { FileServices } from '@prisma/client';
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
  if (req.method === 'GET') {
    const messages = await ChatMessageManager.findUserMessages(userId);
    const fileServices = await FileServiceManager.findFileServices(false);
    const data = messages.map((x) => {
      const fileServer = fileServices.find(
        (f: FileServices) => f.id === x.chatModel!.fileServerId
      );
      return {
        id: x.id,
        name: x.name,
        messages: JSON.parse(x.messages),
        prompt: x.prompt,
        model: {
          id: x.chatModel.id,
          modelVersion: x.chatModel.modelVersion,
          name: x.chatModel.name,
          type: x.chatModel.type,
          // systemPrompt: x.chatModel.systemPrompt,
          fileConfig: x.chatModel.fileConfig,
          fileServerConfig: fileServer
            ? {
                id: fileServer.id,
                type: fileServer.type,
              }
            : null,
        },
        isShared: x.isShared,
      };
    });
    return data;
  } else if (req.method === 'PUT') {
    const { id, name, isShared } = req.body;
    const userMessage = await ChatMessageManager.findUserMessageById(
      id,
      userId
    );
    if (!userMessage || userMessage.isDeleted) {
      throw new BadRequest();
    }
    await ChatMessageManager.updateUserMessage(
      id,
      name || userMessage.name,
      isShared
    );
  } else if (req.method === 'DELETE') {
    const { id } = req.query as { id: string };
    await ChatMessageManager.deleteMessageById(id);
  }
};

export default apiHandler(handler);
