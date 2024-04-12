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
};

export default apiHandler(handler);
