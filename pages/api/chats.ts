import { apiHandler } from '@/middleware/api-handler';
import { ChatsApiRequest } from '@/types/next-api';
import {
  ChatMessagesManager,
  ChatModelManager,
  ChatsManager,
} from '@/managers';
import { BadRequest } from '@/utils/error';
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
    const { id } = req.query as { id: string };
    const chatModels = await ChatModelManager.findModels(true);
    if (id) {
      const chat = await ChatsManager.findByUserChatId(id, userId);
      if (!chat) throw new BadRequest();
      const chatModel = chatModels.find((x) => x.id === chat.chatModelId);
      return {
        id: chat.id,
        title: chat.title,
        chatModelId: chat.chatModelId,
        modelName: chatModel?.name,
        modelConfig: JSON.parse(chatModel?.modelConfig || '{}'),
        userModelConfig: JSON.parse(chat.userModelConfig || '{}'),
        isShared: chat.isShared,
      };
    }
    const chats = await ChatsManager.findUserChats(userId);
    return chats.map((c) => {
      const chatModel = chatModels.find((x) => x.id === c.chatModelId);
      return {
        id: c.id,
        title: c.title,
        chatModelId: c.chatModelId,
        modelName: chatModel?.name,
        modelConfig: JSON.parse(chatModel?.modelConfig || '{}'),
        userModelConfig: JSON.parse(c.userModelConfig || '{}'),
        isShared: c.isShared,
      };
    });
  } else if (req.method === 'POST') {
    const { title } = req.body;
    return await ChatsManager.create({ title, userId });
  } else if (req.method === 'PUT') {
    const { id, title, isShared } = req.body;
    const chat = ChatsManager.findByUserChatId(id, userId);
    if (!chat) {
      throw new BadRequest();
    }
    return await ChatsManager.update({ id, title, isShared });
  } else if (req.method === 'DELETE') {
    const { id } = req.query as { id: string };
    const chat = await ChatsManager.findByUserChatId(id, userId);
    if (!chat) {
      throw new BadRequest();
    }
    await ChatMessagesManager.deleteByChatId(id, userId);
    return await ChatsManager.delete(id);
  }
};

export default apiHandler(handler);
