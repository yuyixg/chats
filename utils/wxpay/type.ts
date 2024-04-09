// 支付者
export interface Ipay {
  appid: string; //  直连商户申请的公众号或移动应用appid。
  mchid: string; // 商户号
  serial_no?: string; // 证书序列号
  publicKey: Buffer; // 公钥
  privateKey: Buffer; // 密钥
  authType?: string; // 认证类型，目前为WECHATPAY2-SHA256-RSA2048
  userAgent?: string;
  key?: string;
}

// 订单金额信息
interface Iamount {
  total: number;
  currency?: string;
}

// 优惠功能
interface Idetail {
  cost_price?: number;
  invoice_id?: string;
  goods_detail?: IgoodsDetail[];
}

// 单品列表信息
interface IgoodsDetail {
  merchant_goods_id: string;
  wechatpay_goods_id?: string;
  goods_name?: string;
  quantity: number;
  unit_price: number;
}

// 商户门店信息
interface IstoreInfo {
  id: string;
  name?: string;
  area_code?: string;
  address?: string;
}

// H5场景信息
interface Ih5Info {
  type: string;
  app_name: string;
  app_url?: string;
  bundle_id?: string;
  package_name?: string;
}

// 支付场景描述
interface IsceneInfoH5 {
  payer_client_ip: string;
  device_id?: string;
  store_info?: IstoreInfo;
  h5_info: Ih5Info;
}

export interface Ih5 {
  description: string;
  out_trade_no: string;
  time_expire?: string;
  attach?: string;
  notify_url: string;
  goods_tag?: string;
  amount: Iamount;
  detail?: Idetail;
  scene_info: IsceneInfoH5;
}

export interface IJsApi {
  description: string;
  out_trade_no: string;
  time_expire?: string;
  attach?: string;
  notify_url: string;
  goods_tag?: string;
  amount: Iamount;
  payer: { openid: string };
  detail?: Idetail;
  scene_info?: IsceneInfoNative;
}

interface IsceneInfoNative {
  payer_client_ip: string;
  device_id?: string;
  store_info?: IstoreInfo;
}

// 抛出
export interface Ioptions {
  userAgent?: string;
  authType?: string;
  key?: string;
  serial_no?: string;
}

/**
 * 统一返回格式
 */
export interface Output {
  status: number;
  error?: any;
  data?: any;
}

export interface IPayNotifyDecipher {
  mchid: string;
  appid: string;
  out_trade_no: string;
  transaction_id: string;
  trade_type: string;
  trade_state: string;
  trade_state_desc: string;
  bank_type: string;
  attach: string;
  success_time: string;
  payer: { openid: string };
  amount: IAmount;
}

interface IAmount {
  total: number;
  payer_total: number;
  currency: string;
  payer_currency: string;
}

export interface IWxPayNotifyBody {
  id: string;
  create_time: string;
  resource_type: string;
  event_type: string;
  summary: string;
  resource: IResource;
  decipherModel: IPayNotifyDecipher;
}

interface IResource {
  original_type: string;
  algorithm: string;
  ciphertext: string;
  associated_data: string;
  nonce: string;
}

export enum PayEventType {
  SUCCESS = 'TRANSACTION.SUCCESS',
}
