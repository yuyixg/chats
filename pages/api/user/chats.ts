import { BadRequest } from '@/utils/error';

import { ChatsApiRequest } from '@/types/next-api';

import { ChatModelManager, ChatsManager } from '@/managers';
import { apiHandler } from '@/middleware/api-handler';

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
    const { id, page, pageSize, query } = req.query as {
      id: string;
      page: string;
      pageSize: string;
      query: string;
    };
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
    const _page = Number(page) || 1,
      _pageSize = Number(pageSize) || 50;

    const chats = await ChatsManager.findChatsByPaging({
      userId,
      page: _page,
      pageSize: _pageSize,
      query,
    });

    const rows = chats.rows.reverse().map((c) => {
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
    return { rows, count: chats.count };
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
    return await ChatsManager.delete(id);
  }
};

export default apiHandler(handler);
