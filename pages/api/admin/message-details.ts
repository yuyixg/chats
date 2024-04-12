import { ChatMessageManager } from '@/managers';
import { UserRole } from '@/types/admin';
import { getSession } from '@/utils/session';
import { InternalServerError } from '@/utils/error';
import { apiHandler } from '@/middleware/api-handler';
import { ChatsApiRequest, ChatsApiResponse } from '@/types/next-api';
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 5,
};

const handler = async (req: ChatsApiRequest, res: ChatsApiResponse) => {
  try {
    if (req.method === 'GET') {
      const { messageId } = req.query as {
        messageId: string;
      };
      if (messageId) {
        const message = await ChatMessageManager.findMessageById(messageId);
        return {
          name: message?.name,
          prompt: message?.prompt,
          messages: JSON.parse(message?.messages || '[]'),
        };
      }
    }
  } catch (error: any) {
    throw new InternalServerError(
      JSON.stringify({ message: error?.message, stack: error?.stack })
    );
  }
};

export default apiHandler(handler);
