import { NextApiRequest, NextApiResponse } from 'next';
import { SessionsManager, UsersManager } from '@/managers';
import { BadRequest, InternalServerError } from '@/utils/error';
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
      throw new BadRequest('Username or password incorrect');
    }
  } catch (error: any) {
    throw new InternalServerError(
      JSON.stringify({ message: error?.message, stack: error?.stack })
    );
  }
}

export default apiHandler(handler);
