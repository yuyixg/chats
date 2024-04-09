import type { NextApiRequest, NextApiResponse } from 'next';
import { IWxPayNotifyBody, PayEventType } from '@/utils/wxpay/type';
import { OrdersManager, UserBalancesManager } from '@/managers';
import { OrderStatus } from '@/types/order';
import Decimal from 'decimal.js';
import { centsToYuan } from '@/utils/wxpay/utils';
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

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === 'POST') {
      const { event_type, decipherModel } = req.body as IWxPayNotifyBody;
      console.log('notify', JSON.stringify(req.body));
      if (decipherModel && event_type === PayEventType.SUCCESS) {
        const attach = JSON.parse(decipherModel.attach) as IDecipherAttach;
        console.log('notify', decipherModel.attach);
        const { orderId } = attach;
        const order = await OrdersManager.findById(orderId);
        if (order?.status === OrderStatus.Waiting) {
          await OrdersManager.updateOrderStatus(orderId, OrderStatus.Completed);
          await OrdersManager.createOrderCounterfoil({
            orderId,
            info: JSON.stringify(decipherModel),
          });
          await UserBalancesManager.updateBalance(
            order.createUserId,
            new Decimal(centsToYuan(order.amount)),
            order.createUserId
          );
        }
        return res.status(200).end();
      } else {
        return res.status(400).json({ code: 'FAIL' });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(400).json({ code: 'FAIL' });
  }
};

export default handler;
