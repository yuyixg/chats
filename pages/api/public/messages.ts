import { NextApiRequest } from 'next';
import { BadRequest } from '@/utils/error';
import { ChatMessagesManager, ChatsManager } from '@/managers';
import { apiHandler } from '@/middleware/api-handler';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 5,
};

const handler = async (req: NextApiRequest) => {
  const { chatId } = req.query as {
    chatId: string;
  };
  
  if (!chatId) {
    throw new BadRequest();
  }

  const chat = await ChatsManager.findChatById(chatId);
  if (!chat || !chat.isShared) {
    throw new BadRequest();
  }

  if (chatId) {
    const chat = await ChatsManager.findChatIncludeAllById(chatId);
    const chatMessages =
      await ChatMessagesManager.findUserMessageDetailByChatId(chatId);
    return {
      name: chat?.title,
      modelName: chat?.chatModel?.name,
      messages: chatMessages,
    };
  }
};

export default apiHandler(handler);
