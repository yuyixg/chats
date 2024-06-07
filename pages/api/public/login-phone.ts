import { NextApiRequest } from 'next';

import { BadRequest } from '@/utils/error';

import { LoginType } from '@/types/user';

import {
  PayServiceManager,
  SessionsManager,
  SmsManager,
  UsersManager,
} from '@/managers';
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
    const { phone, code } = req.body;
    const smsVerify = await SmsManager.verifyUserSignInCode(phone, code);
    if (!smsVerify) {
      throw new BadRequest('验证码错误');
    } else {
      let user = await UsersManager.findByAccount(phone);
      if (!user) {
        user = await UsersManager.createUser({
          account: phone,
          username: phone,
          phone: phone,
          role: '-',
        });
        await UsersManager.initialUser(user.id, LoginType.Phone);
      }
      const pays = await PayServiceManager.findAllEnabled();
      const session = await SessionsManager.generateSession(user.id!);
      await SmsManager.updateStatusToVerified(smsVerify.id);
      return {
        sessionId: session.id,
        username: user.username,
        role: user.role,
        canRecharge: pays.length > 0,
      };
    }
  }
}

export default apiHandler(handler);
