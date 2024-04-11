import type { NextApiRequest, NextApiResponse } from 'next';
import { UsersManager } from '@/managers';
import { UserRole } from '@/types/admin';
import { getSession } from '@/utils/session';
import { internalServerError } from '@/utils/error';
import { UsersRelate } from '@/db/type';
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
      const { query } = req.query;
      const users = await UsersManager.findUsers(query as string);
      const data = users.map((x: UsersRelate) => {
        return {
          id: x.id,
          username: x.username,
          account: x.account,
          role: x.role,
          balance: x.userBalances?.balance,
          avatar: x.avatar,
          phone: x.phone,
          email: x.email,
          provider: x.provider,
          enabled: x.enabled,
          createdAt: x.createdAt,
        };
      });
      return res.json(data);
    } else if (req.method === 'PUT') {
      const { id, username, password, role, enabled, phone, email } = req.body;
      let user = await UsersManager.findByUserId(id);
      if (!user) {
        return res.status(404).send('User not found.');
      }
      const data = await UsersManager.updateUser({
        id,
        username,
        password: password ? password : user.password,
        role,
        enabled,
        phone,
        email,
      });
      return res.send(data);
    } else {
      const { account, password, role } = req.body;
      let isFound = await UsersManager.findByAccount(account);
      if (isFound) {
        return res.status(400).send('User existed.');
      }
      const user = await UsersManager.createUser({
        account,
        password,
        role,
      });
      await UsersManager.initialUser(user.id!, session.userId);
      return res.json(user);
    }
  } catch (error) {
    console.error(error);
    return internalServerError(res);
  }
};

export default handler;
