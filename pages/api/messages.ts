import type { NextApiRequest, NextApiResponse } from 'next';
import { ChatMessageManager, FileServerManager } from '@/managers';
import { getSession } from '@/utils/session';
import { badRequest, internalServerError } from '@/utils/error';
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
      const fileServers = await FileServerManager.findFileServers(false);
      const data = messages.map((x) => {
        const fileServer = fileServers.find(
          (f) => f.id === x.chatModel.fileServerId
        );
        return {
          id: x.id,
          name: x.name,
          messages: JSON.parse(x.messages),
          prompt: x.prompt,
          model: {
            id: x.chatModel.id,
            modelVersion: x.chatModel.modelVersion,
            name: x.chatModel.name,
            type: x.chatModel.type,
            // systemPrompt: x.chatModel.systemPrompt,
            fileConfig: x.chatModel.fileConfig,
            fileServerConfig: fileServer
              ? {
                  id: fileServer.id,
                  type: fileServer.type,
                }
              : null,
          },
          isShared: x.isShared,
        };
      });
      return res.json(data);
    } else if (req.method === 'PUT') {
      const { id, name, isShared } = req.body;
      const userMessage = await ChatMessageManager.findUserMessageById(
        id,
        session.userId
      );
      if (!userMessage || userMessage.isDeleted) {
        return badRequest(res);
      }
      await ChatMessageManager.updateUserMessage(
        id,
        name || userMessage.name,
        isShared
      );
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
