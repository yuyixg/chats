import type { NextApiRequest, NextApiResponse } from 'next';
import { ChatMessageManager } from '@/managers';
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

  try {
    if (req.method === 'GET') {
      const messages = await ChatMessageManager.findUserMessages(
        session.userId
      );
      const data = messages.map((x) => {
        return {
          id: x.id,
          name: x.name,
          messages: x.messages,
          prompt: x.prompt,
          model: x.ChatModel,
        };
      });
      return res.json(data);
    } else if (req.method === 'PUT') {
      const { id, name } = req.body;
      await ChatMessageManager.updateMessageName(id, name);
      res.end();
    } else if (req.method === 'DELETE') {
      const { id } = req.query as { id: string };
      await ChatMessageManager.deleteMessageById(id);
      res.end();
    }
  } catch (error) {
    console.error(error);
    return internalServerError(res);
  }
};

export default handler;
