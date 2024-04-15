import { IWeChatAuthResult } from '@/managers/users';
import { InternalServerError } from './error';

export function redirectToWeChatAuthUrl(redirectUri: string) {
  const scope = 'snsapi_base';
  location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx05e69f4a0aeb8421&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=STATE#wechat_redirect`;
}

export async function weChatAuth(code: string) {
  const { WECHAT_APP_ID, WECHAT_SECRET } = process.env;
  try {
    const res = await fetch(
      `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${WECHAT_APP_ID}&secret=${WECHAT_SECRET}&code=${code}&grant_type=authorization_code`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    const response: IWeChatAuthResult = await res.json();
    if (response.errcode) {
      throw new InternalServerError(JSON.stringify(response));
    }
    return response;
  } catch (error) {
    throw new InternalServerError(`${error}`);
  }
}
