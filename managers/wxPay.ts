import { IJsApi, Ih5 } from '@/utils/wxpay/type';
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
  static async callWxJSApiPay(params: CallWxJSApiPay) {
    const { amount, orderId, ipAddress, openId, outTradeNo } = params;
    const {
      WECHAT_PAY_APP_ID,
      WECHAT_PAY_MCHID,
      WECHAT_PAY_API_V3_KEY,
      WECHAT_PAY_NOTIFY_URL,
    } = process.env;
    const notifyUrl = WECHAT_PAY_NOTIFY_URL + '/api/payment/notify';
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
    const publicKey = await fs.readFileSync(
      `${process.cwd()}/cert/apiclient_cert.pem`
    );
    const privateKey = await fs.readFileSync(
      `${process.cwd()}/cert/apiclient_key.pem`
    );
    const weChartPay = new WxPay(
      WECHAT_PAY_APP_ID!,
      WECHAT_PAY_MCHID!,
      publicKey,
      privateKey,
      {
        key: WECHAT_PAY_API_V3_KEY!,
      }
    );
    return await weChartPay.transactions_jsapi(options);
  }

  static async callWxH5Pay(params: CallWxH5Pay) {
    const { amount, orderId, ipAddress, outTradeNo } = params;
    const {
      WECHAT_PAY_APP_ID,
      WECHAT_PAY_MCHID,
      WECHAT_PAY_API_V3_KEY,
      WECHAT_PAY_NOTIFY_URL,
    } = process.env;
    const notifyUrl = WECHAT_PAY_NOTIFY_URL + '/api/payment/notify';
    const options = {
      description: `Order:${orderId}`,
      attach: JSON.stringify({
        orderId: orderId,
      }),
      out_trade_no: outTradeNo,
      scene_info: {
        payer_client_ip: ipAddress,
        h5_info: { app_name: 'wxpay', type: 'Wap' },
      },
      amount: { total: amount, currency: 'CNY' },
      notify_url: notifyUrl,
    } as Ih5;
    const publicKey = await fs.readFileSync(
      `${process.cwd()}/cert/apiclient_cert.pem`
    );
    const privateKey = await fs.readFileSync(
      `${process.cwd()}/cert/apiclient_key.pem`
    );
    const weChartPay = new WxPay(
      WECHAT_PAY_APP_ID!,
      WECHAT_PAY_MCHID!,
      publicKey,
      privateKey,
      {
        key: WECHAT_PAY_API_V3_KEY!,
      }
    );
    return await weChartPay.transactions_h5(options);
  }
}
