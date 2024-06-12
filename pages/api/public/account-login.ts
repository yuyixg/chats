import { NextApiRequest } from 'next';

import { BadRequest } from '@/utils/error';

import { PayServiceManager, SessionsManager, UsersManager } from '@/managers';
import { apiHandler } from '@/middleware/api-handler';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 5,
};

async function handler(req: NextApiRequest) {
  if (req.method === 'POST') {
    const { username, password, code } = req.body;
    let user = null;
    if (code) {
      user = await UsersManager.weChatLogin(code);
    } else {
      user = await UsersManager.singIn(username, password);
    }

    if (user) {
      if (!user?.enabled) {
        throw new BadRequest('用户已被禁用，请联系管理人员');
      }
      const pays = await PayServiceManager.findAllEnabled();
      const session = await SessionsManager.generateSession(user.id!);
      return {
        sessionId: session.id,
        username: user.username,
        role: user.role,
        canRecharge: pays.length > 0,
      };
    }
    throw new BadRequest('Username or password incorrect');
  }
}

export default apiHandler(handler);
