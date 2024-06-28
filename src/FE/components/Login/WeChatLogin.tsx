import { useEffect, useState } from 'react';

import Image from 'next/image';

import { Button } from '../ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import WeChatLoginModal from './WeChatLoginModal';

const WeChatLogin = (props: {
  configs: { appId: string };
  loading?: boolean;
}) => {
  const { loading, configs } = props;
  const [weChatModal, setWeChatModal] = useState(false);
  useEffect(() => {}, []);

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => {
                setWeChatModal(true);
              }}
              className="p-0 w-8 h-8"
              disabled={loading}
              variant="link"
            >
              <Image
                src="/wechat.svg"
                alt="WeChat"
                width={0}
                height={0}
                className="h-8 w-8 dark:bg-transparent"
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>微信登录</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {weChatModal && (
        <WeChatLoginModal
          appId={configs.appId}
          isOpen={weChatModal}
          onClose={() => {
            setWeChatModal(false);
          }}
        />
      )}
    </>
  );
};
export default WeChatLogin;
