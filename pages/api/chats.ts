import { apiHandler } from '@/middleware/api-handler';
import { ChatsApiRequest } from '@/types/next-api';
import { ChatsManager } from '@/managers';
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
    const chats = await ChatsManager.findUserChats(userId);
    return chats.map((c) => {
      return {
        id: c.id,
        title: c.title,
        chatModelId: c.chatModelId,
        displayingLeafChatMessageNodeId: c.displayingLeafChatMessageNodeId,
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
    const chat = ChatsManager.findByUserChatId(id, userId);
    if (!chat) {
      throw new BadRequest();
    }
    return await ChatsManager.delete(id);
  }
};

export default apiHandler(handler);
