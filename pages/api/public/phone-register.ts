import { NextApiRequest } from 'next';

import { BadRequest } from '@/utils/error';

import { LoginType, SmsType } from '@/types/user';

import {
  InvitationCodeManager,
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
    const { phone, smsCode, invitationCode } = req.body;
    const smsVerify = await SmsManager.verifyUserSignInCode(
      phone,
      smsCode,
      SmsType.Register,
    );
    const code = await InvitationCodeManager.verifyCode(invitationCode);
    if (!code || code.count == 0) {
      throw new BadRequest('邀请码错误或过期');
    }
    if (!smsVerify || smsVerify.code != smsCode) {
      throw new BadRequest('验证码错误');
    } else {
      let user = await UsersManager.findByPhone(phone);
      if (user) {
        throw new BadRequest('用户已存在');
      }
      if (!user) {
        user = await UsersManager.createUser({
          account: phone,
          username: phone,
          phone: phone,
          provider: LoginType.Phone,
          role: '-',
        });
        await UsersManager.initialUser(user.id, LoginType.Phone, code.id);
        await InvitationCodeManager.createUserInvitation(user.id, code.id);
      }
      const pays = await PayServiceManager.findAllEnabled();
      const session = await SessionsManager.generateSession(user.id!);
      code &&
        (await InvitationCodeManager.updateCodeCount(code.id, --code.count));
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
