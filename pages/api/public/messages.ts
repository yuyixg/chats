import { NextApiRequest } from 'next';
import { BadRequest } from '@/utils/error';
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

const handler = async (req: NextApiRequest) => {
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
};

export default apiHandler(handler);
