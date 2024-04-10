import type { NextApiRequest, NextApiResponse } from 'next';
import { badRequest, internalServerError } from '@/utils/error';
import requestIp from 'request-ip';
import { OrdersManager, WxPayManager } from '@/managers';
import { weChatAuth } from '@/utils/weChat';
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
    if (req.method === 'POST') {
      const { orderId, code } = req.body as {
        orderId: string;
        code: string;
      };
      const order = await OrdersManager.findById(orderId);
      if (!order) {
        return badRequest(res, '订单不存在');
      }

      // const weChatAuthResult = await weChatAuth(code);
      // if (!weChatAuthResult) {
      //   return badRequest(res, '微信授权失败');
      // }

      const ipAddress = requestIp.getClientIp(req) || '127.0.0.1';
      const result = await WxPayManager.callWxH5Pay({
        ipAddress,
        orderId: order.id,
        amount: order.amount,
        outTradeNo: order.outTradeNo,
      });
      return res.json(result);
    }
  } catch (error) {
    console.error(error);
    return internalServerError(res);
  }
};

export default handler;
