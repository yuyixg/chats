import { createWeChatPayment } from '@/apis/payApiService';
import { redirectToWeChatAuthUrl } from '@/utils/weChat';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
export default function Payment() {
  const router = useRouter();
  const { code, id } = router.query as { id: string; code: string };
  useEffect(() => {
    if (code) {
      createWeChatPayment(code, id)
        .then((paySign) => {
          WeixinJSBridge.invoke(
            'getBrandWCPayRequest',
            paySign,
            function (res: any) {
              if (res.err_msg === 'get_brand_wcpay_request:ok') {
                toast.success('支付成功');
                setTimeout(() => {
                  router.push('/');
                }, 2000);
              }
              if (res.err_msg === 'get_brand_wcpay_request:cancel') {
                WeixinJSBridge.call('closeWindow');
              }

              if (res.err_msg === 'get_brand_wcpay_request:fail') {
                WeixinJSBridge.call('closeWindow');
              }
            }
          );
        })
        .catch(() => {
          toast.error('支付异常,请稍后再试');
          setTimeout(() => {
            WeixinJSBridge.call('closeWindow');
          }, 1000);
        });
    } else {
      const redirectUri = encodeURIComponent(location.href);
      redirectToWeChatAuthUrl(redirectUri);
    }
  }, []);
  return <></>;
}

export const getServerSideProps = async () => {
  return {
    props: {},
  };
};
