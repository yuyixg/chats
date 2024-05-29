import { ChatsApiRequest } from '@/types/next-api';

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

const handler = async (req: ChatsApiRequest) => {
  if (req.method === 'GET') {
    const { chatId } = req.query as {
      chatId: string;
    };
    if (chatId) {
      const chat = await ChatsManager.findChatIncludeAllById(chatId);
      const chatMessages =
        await ChatMessagesManager.findUserMessageDetailByChatId(chatId);
      const modelConfig = JSON.parse(chat?.chatModel?.modelConfig || '{}');
      const userModelConfig = JSON.parse(chat?.userModelConfig || '{}');
      return {
        name: chat?.title,
        modelName: chat?.chatModel?.name,
        modelTemperature:
          userModelConfig?.temperature || modelConfig?.temperature,
        modelPrompt: userModelConfig?.prompt || modelConfig?.prompt,
        messages: chatMessages,
      };
    }
  }
};

export default apiHandler(handler);
