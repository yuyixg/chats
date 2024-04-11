import type { NextApiRequest, NextApiResponse } from 'next';
import { ChatMessageManager } from '@/managers';
import { UserRole } from '@/types/admin';
import { getSession } from '@/utils/session';
import { InternalServerError } from '@/utils/error';
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
  const session = await getSession(req.cookies);
  if (!session) {
    return res.status(401).end();
  }
  const role = session.role;
  if (role !== UserRole.admin) {
    res.status(401).end();
    return;
  }

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
