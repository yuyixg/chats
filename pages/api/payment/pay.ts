import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@/utils/session';
import { internalServerError, unauthorized } from '@/utils/error';
import requestIp from 'request-ip';
import { OrdersManager, WxPayManager } from '@/managers';
import { generateOrderTradeNo } from '@/utils/wxpay/utils';
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 5,
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getSession(req.cookies);
    if (!session) {
      return unauthorized(res);
    }
    if (req.method === 'POST') {
      const { amount } = req.body as { amount: number };
      const outTradeNo = generateOrderTradeNo();
      console.log(amount, outTradeNo);
      return res.end();
      // const order = await OrdersManager.createOrder({
      //   outTradeNo,
      //   amount,
      //   createUserId: session.userId,
      // });
      // const ipAddress = requestIp.getClientIp(req) || '127.0.0.1';
      // return await WxPayManager.callWxJSApiPay({
      //   ipAddress,
      //   orderId: order.id,
      //   amount,
      //   openId: session.sub!,
      //   outTradeNo,
      // });
    }
  } catch (error) {
    console.error(error);
    return internalServerError(res);
  }
};

export default handler;
