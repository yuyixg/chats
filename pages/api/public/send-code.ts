import { PhoneRegExp } from '@/utils/common';
import { BadRequest } from '@/utils/error';
import { sendSmsAsync } from '@/utils/tencentSmsClient';
import { IWxPayNotifyBody, PayEventType } from '@/utils/wxpay/type';
import { centsToYuan } from '@/utils/wxpay/utils';

import { ChatsApiRequest } from '@/types/next-api';
import { OrderStatus } from '@/types/order';

import {
  OrdersManager,
  SmsManager,
  UserBalancesManager,
  WxPayManager,
} from '@/managers';
import { apiHandler } from '@/middleware/api-handler';
import Decimal from 'decimal.js';

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
