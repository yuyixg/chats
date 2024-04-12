import { InternalServerError } from '@/utils/error';
import { generateOrderTradeNo } from '@/utils/wxpay/utils';
import { OrdersManager } from '@/managers';
import { apiHandler } from '@/middleware/api-handler';
import { ChatsApiRequest } from '@/types/next-api';
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 5,
};

const handler = async (req: ChatsApiRequest) => {
  try {
    const { userId } = req.session;
    if (req.method === 'POST') {
      const { amount } = req.body as { amount: number };
      const outTradeNo = generateOrderTradeNo();
      const order = await OrdersManager.createOrder({
        outTradeNo,
        amount,
        createUserId: userId,
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
