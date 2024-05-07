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
  const { messageId } = req.query as { messageId: string };
  if (!messageId) {
    throw new BadRequest();
  }
  const chat = await ChatsManager.findChatById(messageId);
  if (!chat || !chat.isShared) {
    throw new BadRequest();
  }

  const messages = await ChatMessagesManager.findUserMessageByChatId(chat.id);

  return {
    name: chat.title,
    prompt: chat.userModelConfig,
    messages: messages,
  };
};

export default apiHandler(handler);
