import { NextApiRequest, NextApiResponse } from 'next';
import { SessionsManager, UsersManager } from '@/managers';
import { badRequest, internalServerError } from '@/utils/error';
import bcrypt from 'bcryptjs';
import { getSession } from '@/utils/session';
import { apiHandler } from '@/middleware/api-handler';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 5,
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      const { username, password, code } = req.body;
      let user = null;
      if (code) {
        user = await UsersManager.weChatLogin(code);
      } else {
        user = await UsersManager.singIn(username, password);
      }

      if (user) {
        const session = await SessionsManager.generateSession(user.id!);
        return {
          sessionId: session.id,
          username: user.username,
          role: user.role,
        };
      }
      return badRequest(res, 'Username or password incorrect');
    } else if (req.method === 'PUT') {
      const session = await getSession(req.cookies);
      if (!session) {
        return res.status(401).end();
      }
      const { newPassword } = req.body;
      const user = await UsersManager.findByUserId(session.userId);
      if (!user) {
        return badRequest(res, 'User not found');
      }
      const hashPassword = await bcrypt.hashSync(newPassword);
      const result = await UsersManager.updateUserPassword(
        user.id!,
        hashPassword
      );
      return result;
    }
  } catch (error: any) {
    return internalServerError(res);
  }
}

export default apiHandler(handler);
