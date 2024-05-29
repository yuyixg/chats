import { ChatsApiRequest } from '@/types/next-api';

import { ChatsManager } from '@/managers';
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
  if (req.method === 'GET') {
    const { query, page, pageSize } = req.query as {
      query: string;
      page: string;
      pageSize: string;
    };
    const chats = await ChatsManager.findChatsByPage(
      query,
      parseInt(page),
      parseInt(pageSize),
    );
    const rows = chats.rows.map((x) => {
      return {
        id: x.id,
        username: x.user.username,
        title: x.title,
        modelName: x?.chatModel?.name,
        isDeleted: x.isDeleted,
        isShared: x.isShared,
        userModelConfig: JSON.parse(x.userModelConfig || '{}'),
        createdAt: x.createdAt,
      };
    });
    return { rows, count: chats.count };
  }
};

export default apiHandler(handler);
