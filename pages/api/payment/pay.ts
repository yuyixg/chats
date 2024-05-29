import { generateOrderTradeNo } from '@/utils/wxpay/utils';

import { ChatsApiRequest } from '@/types/next-api';

import { OrdersManager, WxPayManager } from '@/managers';
import { apiHandler } from '@/middleware/api-handler';
import requestIp from 'request-ip';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 5,
};

const handler = async (req: ChatsApiRequest) => {
  if (req.method === 'POST') {
    const { amount } = req.body as { amount: number };
    const outTradeNo = generateOrderTradeNo();
    const order = await OrdersManager.createOrder({
      outTradeNo,
      amount,
      createUserId: req.session.userId,
    });
    const ipAddress = requestIp.getClientIp(req) || '127.0.0.1';
    return await WxPayManager.callWxJSApiPay({
      ipAddress,
      orderId: order.id,
      amount,
      openId: req.session.sub!,
      outTradeNo,
    });
  }
};

export default apiHandler(handler);
