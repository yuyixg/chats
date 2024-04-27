import { ChatMessagesManager } from '@/managers';
import { apiHandler } from '@/middleware/api-handler';
import { ChatsApiRequest } from '@/types/next-api';
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
    const { chatId } = req.query as { chatId: string };
    const chatMessages = await ChatMessagesManager.findUserMessageByChatId(
      userId,
      chatId
    );
    return chatMessages;
  } else if (req.method === 'DELETE') {
    const { id } = req.query as { id: string };
    const message = await ChatMessagesManager.findByUserMessageId(id, userId);
    if (!message) {
      throw new BadRequest();
    }
    await ChatMessagesManager.delete(id);
  }
};

export default apiHandler(handler);
