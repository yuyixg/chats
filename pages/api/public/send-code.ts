import { PhoneRegExp } from '@/utils/common';
import { BadRequest } from '@/utils/error';

import { ChatsApiRequest } from '@/types/next-api';
import { SmsType } from '@/types/user';

import { SmsManager, UsersManager } from '@/managers';
import { apiHandler } from '@/middleware/api-handler';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 5,
};

export interface IDecipherAttach {
  orderId: string;
  requestId: string;
}

const handler = async (req: ChatsApiRequest) => {
  if (req.method === 'POST') {
    const { phone, type } = req.body;
    let smsType = SmsType.SignIn;
    if (type === SmsType.SignIn) {
      const user = await UsersManager.findByPhone(phone);
      if (!user) {
        throw new BadRequest('手机号码或账号不存在，请先注册');
      }
    } else {
      smsType = SmsType.Register;
    }
    if (phone && PhoneRegExp.test(phone)) {
      await SmsManager.sendSignInCode(phone, smsType);
      return true;
    }
    throw new BadRequest('手机号码不正确');
  }
};

export default apiHandler(handler);
