import { useFetch } from '@/hooks/useFetch';
import { IWeChatAuthResult } from '@/managers/users';

export function redirectToWeChatAuthUrl(redirectUri: string) {
  // snsapi_userinfo 需要用户手动授权
  // snsapi_base 默认授权 只能获取openid
  const scope = 'snsapi_base';
  // const redirectUri = encodeURIComponent(`${origin}/authorizing`);
  location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxcf07ba9d66de4aca&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=STATE#wechat_redirect`;
}

export async function weChatAuth(code: string) {
  const fetchServer = useFetch();
  const res = await fetchServer.get<IWeChatAuthResult>(
    `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${process.env.WECHAT_APP_ID}&secret=${process.env.WECHAT_SECRET}&code=${code}&grant_type=authorization_code`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  if (res.errcode) {
    return null;
  }
  return res;
}
