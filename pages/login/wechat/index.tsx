import WeChatLogin from '@/components/WeChat/WxLogin';

const LoginWeChat = () => <WeChatLogin />;

export const getServerSideProps = async () => {
  return {
    props: {},
  };
};
export default LoginWeChat;
