import { NextApiRequest, NextApiResponse } from 'next';
import { BadRequest, InternalServerError } from '@/utils/error';
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
      throw new BadRequest();
    }
    const message = await ChatMessageManager.findMessageById(messageId);
    if (!message || !message.isShared) {
      throw new BadRequest();
    }
    return {
      name: message?.name,
      prompt: message?.prompt,
      messages: JSON.parse(message?.messages || '[]'),
    };
  } catch (error: any) {
    throw new InternalServerError(
      JSON.stringify({ message: error?.message, stack: error?.stack })
    );
  }
};

export default apiHandler(handler);
