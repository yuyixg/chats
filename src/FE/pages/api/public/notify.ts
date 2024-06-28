import { BadRequest } from '@/utils/error';
import { IWxPayNotifyBody, PayEventType } from '@/utils/wxpay/type';
import { centsToYuan } from '@/utils/wxpay/utils';

import { ChatsApiRequest } from '@/types/next-api';
import { OrderStatus } from '@/types/order';

import { OrdersManager, UserBalancesManager, WxPayManager } from '@/managers';
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
    const { event_type, resource } = req.body as IWxPayNotifyBody;
    if (event_type === PayEventType.SUCCESS) {
      const decipherModel = await WxPayManager.decipherGCM(resource);
      const attach = JSON.parse(decipherModel.attach) as IDecipherAttach;
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
          order.createUserId,
        );
      }
    } else {
      throw new BadRequest(JSON.stringify({ code: 'FAIL' }));
    }
  }
};

export default apiHandler(handler);
