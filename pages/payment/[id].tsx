import { createWeChatPayment } from '@/apis/payApiService';
import { redirectToWeChatAuthUrl } from '@/utils/weChat';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
export default function Payment() {
  const router = useRouter();
  const { code, id } = router.query as { id: string; code: string };
  useEffect(() => {
    // createWeChatPayment(code, id).then((paySign) => {
    //   toast.success(paySign.h5_url);
    //   setTimeout(() => {
    //     window.location.href = paySign.h5_url;
    //   }, 5000);
    // });
    if (code) {
      createWeChatPayment(code, id)
        .then((paySign) => {
          WeixinJSBridge.invoke(
            'getBrandWCPayRequest',
            paySign,
            function (res: any) {
              if (res.err_msg === 'get_brand_wcpay_request:ok') {
                toast.success('支付成功');
              }
              if (res.err_msg === 'get_brand_wcpay_request:cancel') {
                toast.error('取消支付');
              }

              if (res.err_msg === 'get_brand_wcpay_request:fail') {
                toast.error('支付失败');
              }
            }
          );
        })
        .catch(() => {
          toast.error('支付异常');
        });
    } else {
      // localStorage.setItem('callbackUrl', location.pathname);
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
