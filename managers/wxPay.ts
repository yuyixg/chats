import { IJsApi, IPayNotifyDecipher, IResource } from '@/utils/wxpay/type';
import { WxPay } from '@/utils/wxpay/wxpay';
import fs from 'fs';

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
    const { WECHAT_PAY_APP_ID, WECHAT_PAY_MCHID, WECHAT_PAY_API_V3_KEY } =
      process.env;
    const publicKey = await fs.readFileSync(
      `${process.cwd()}/cert/apiclient_cert.pem`
    );
    const privateKey = await fs.readFileSync(
      `${process.cwd()}/cert/apiclient_key.pem`
    );

    return new WxPay(
      WECHAT_PAY_APP_ID!,
      WECHAT_PAY_MCHID!,
      publicKey,
      privateKey,
      {
        key: WECHAT_PAY_API_V3_KEY!,
      }
    );
  }
  static async callWxJSApiPay(params: CallWxJSApiPay) {
    const { amount, orderId, ipAddress, openId, outTradeNo } = params;
    const { WECHAT_PAY_NOTIFY_URL } = process.env;
    const notifyUrl = `${WECHAT_PAY_NOTIFY_URL}/api/public/notify`;
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
      nonce
    );
    return decipherModel;
  }
}
