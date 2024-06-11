import { PhoneRegExp } from '@/utils/common';
import { BadRequest } from '@/utils/error';

import { ChatsApiRequest } from '@/types/next-api';

import { SmsManager } from '@/managers';
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
    const { phone } = req.body;
    if (phone && PhoneRegExp.test(phone)) {
      await SmsManager.sendSignInCode(phone);
      return true;
    }
    throw new BadRequest('手机号码不正确');
  }
};

export default apiHandler(handler);
