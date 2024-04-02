import type { NextApiRequest, NextApiResponse } from 'next';
import { ChatMessageManager, UserModelManager, UsersManager } from '@/managers';
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
      const { query, page, pageSize } = req.query as {
        query: string;
        page: string;
        pageSize: string;
      };
      const messages = await ChatMessageManager.findMessages(
        query,
        parseInt(page),
        parseInt(pageSize)
      );
      const rows = messages.rows.map((x) => {
        return {
          messageId: x.id,
          username: x.user.username,
          chatCount: x.chatCount,
          tokenCount: x.tokenCount,
          name: x.name,
          modelName: x.chatModel.name,
          totalPrice: x.totalPrice,
          createdAt: x.createdAt,
          updatedAt: x.updatedAt,
        };
      });
      return res.json({ rows, count: messages.count });
    } else if (req.method === 'PUT') {
      const { id, username, password, role } = req.body;
      let user = await UsersManager.findByUserId(id);
      if (!user) {
        return res.status(404).send('User not found.');
      }
      const data = await UsersManager.updateUser({
        id,
        username,
        password: password ? password : user.password,
        role,
      });
      return res.send(data);
    } else {
      const { username, password, role } = req.body;
      let isFound = await UsersManager.findByUsername(username);
      if (isFound) {
        return res.status(400).send('User existed.');
      }
      const user = await UsersManager.createUser({
        username,
        password,
        role,
      });
      await UserModelManager.createUserModel({
        userId: user.id!,
        models: '[]',
      });
      return res.json(user);
    }
  } catch (error) {
    console.error(error);
    return internalServerError(res);
  }
};

export default handler;
