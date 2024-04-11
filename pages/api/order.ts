import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@/utils/session';
import { InternalServerError, Unauthorized } from '@/utils/error';
import { generateOrderTradeNo } from '@/utils/wxpay/utils';
import { OrdersManager } from '@/managers';
import { apiHandler } from '@/middleware/api-handler';
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
      throw new Unauthorized();
    }
    if (req.method === 'POST') {
      const { amount } = req.body as { amount: number };
      const outTradeNo = generateOrderTradeNo();
      const order = await OrdersManager.createOrder({
        outTradeNo,
        amount,
        createUserId: session.userId,
      });
      return order.id;
    }
  } catch (error: any) {
    throw new InternalServerError(
      JSON.stringify({ message: error?.message, stack: error?.stack })
    );
  }
};

export default apiHandler(handler);
