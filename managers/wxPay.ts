import { IJsApi, IPayNotifyDecipher, IResource } from '@/utils/wxpay/type';
import { WxPay } from '@/utils/wxpay/wxpay';

import { PayServiceType } from '@/types/pay';

import { PayServiceManager } from '.';

export interface CallWxJSApiPay {
  amount: number;
  openId: string;
  orderId: string;
  ipAddress: string;
  outTradeNo: string;
}

export interface CallWxH5Pay {
  amount: number;
  orderId: string;
  ipAddress: string;
  outTradeNo: string;
}

export class WxPayManager {
  private static async weChatPay() {
    const payConfig = await PayServiceManager.findConfigsByType(
      PayServiceType.WeChatPay,
    );
    const { appId, mchId, apiV3Key, apiClientCert, apiClientKey } =
      JSON.parse(payConfig);

    return new WxPay(
      appId!,
      mchId!,
      Buffer.from(apiClientCert),
      Buffer.from(apiClientKey),
      {
        key: apiV3Key!,
      },
    );
  }
  static async callWxJSApiPay(params: CallWxJSApiPay) {
    const { amount, orderId, ipAddress, openId, outTradeNo } = params;
    const { NEXT_URL } = process.env;
    const notifyUrl = `${NEXT_URL}/api/public/notify`;
    const options = {
      description: `Order:${orderId}`,
      payer: {
        openid: openId,
      },
      attach: JSON.stringify({
        orderId: orderId,
      }),
      out_trade_no: outTradeNo,
      scene_info: {
        payer_client_ip: ipAddress,
      },
      amount: { total: amount, currency: 'CNY' },
      notify_url: notifyUrl,
    } as IJsApi;
    const weChatPay = await this.weChatPay();
    return await weChatPay.transactions_jsapi(options);
  }

  static async decipherGCM(resource: IResource) {
    const { ciphertext, associated_data, nonce } = resource;
    const weChatPay = await this.weChatPay();
    const decipherModel = weChatPay.decipher_gcm<IPayNotifyDecipher>(
      ciphertext,
      associated_data,
      nonce,
    );
    return decipherModel;
  }
}
