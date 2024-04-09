import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@/utils/session';
import { internalServerError, unauthorized } from '@/utils/error';
import { generateOrderTradeNo } from '@/utils/wxpay/utils';
import { OrdersManager } from '@/managers';
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
      const order = await OrdersManager.createOrder({
        outTradeNo,
        amount,
        createUserId: session.userId,
      });
      return res.json(order.id);
    }
  } catch (error) {
    console.error(error);
    return internalServerError(res);
  }
};

export default handler;
