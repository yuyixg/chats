import useExternal from '@/hooks/useExternal';
import { useEffect } from 'react';

const WeChatLogin = () => {
  const status = useExternal(
    'http://res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js',
    {
      js: {
        async: true,
      },
    }
  );
  useEffect(() => {
    if (status === 'ready') {
      const { origin } = location;
      new WxLogin({
        id: 'wxContainer',
        appid: 'wxcf07ba9d66de4aca',
        scope: 'snsapi_login',
        response_type: 'code',
        state: 'STATE',
        self_redirect: true,
        redirect_uri: encodeURIComponent(`${origin}/authorizing`),
        href: 'data:text/css;base64,LmltcG93ZXJCb3ggLnFyY29kZSB7d2lkdGg6IDIwMHB4O2hlaWdodDogMjAwcHg7fQ0KLmltcG93ZXJCb3ggLmluZm8ge2Rpc3BsYXk6IG5vbmU7fQ==',
      });
    }
  }, [status]);
  return (
    <div
      id='wxContainer'
      className='flex justify-center items-center h-screen'
    ></div>
  );
};

export default WeChatLogin;
