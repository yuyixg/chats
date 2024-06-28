import { stopChat } from '@/utils/chats';
import { BadRequest } from '@/utils/error';

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
  const { userId } = req.session;
  const { chatId } = req.body as { chatId: string };
  if (!chatId) {
    throw new BadRequest();
  }
  const chat = await ChatsManager.findByUserChatId(chatId, userId);
  if (!chat) {
    throw new BadRequest();
  }
  stopChat(chat.id);
  return 'stopped';
};

export default apiHandler(handler);
