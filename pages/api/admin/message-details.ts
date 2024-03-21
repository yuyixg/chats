import type { NextApiRequest, NextApiResponse } from 'next';
import { ChatMessageManager } from '@/managers';
import { UserRole } from '@/types/admin';
import { getSession } from '@/utils/session';
import { internalServerError } from '@/utils/error';
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
        return res.json({
          prompt: message?.prompt,
          messages: message?.messages,
        });
      }
    }
  } catch (error) {
    console.error(error);
    return internalServerError(res);
  }
};

export default handler;
