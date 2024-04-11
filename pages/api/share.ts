import { NextApiRequest, NextApiResponse } from 'next';
import { badRequest, internalServerError } from '@/utils/error';
import { ChatMessageManager } from '@/managers';
import { apiHandler } from '@/middleware/api-handler';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 5,
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { messageId } = req.query as { messageId: string };
    if (!messageId) {
      return badRequest(res);
    }
    const message = await ChatMessageManager.findMessageById(messageId);
    if (!message || !message.isShared) {
      return badRequest(res);
    }
    return {
      name: message?.name,
      prompt: message?.prompt,
      messages: JSON.parse(message?.messages || '[]'),
    };
  } catch (error: any) {
    return internalServerError(res);
  }
};

export default apiHandler(handler);
