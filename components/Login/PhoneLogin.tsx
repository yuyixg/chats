import { useEffect, useState } from 'react';

import Image from 'next/image';

import { Button } from '../ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import PhoneLoginModal from './PhoneLoginModal';

const PhoneLogin = (props: { loading?: boolean }) => {
  const { loading } = props;

  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {}, []);

  return (
    <div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="p-0 w-8 h-8 border"
              disabled={loading}
              variant="link"
              onClick={() => {
                setIsOpen(true);
              }}
            >
              <Image
                src="/phone.svg"
                alt="Phone"
                width={0}
                height={0}
                className="h-6 w-6 dark:bg-transparent"
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>验证码登录</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PhoneLoginModal onClose={() => setIsOpen(false)} isOpen={isOpen} />
    </div>
  );
};
export default PhoneLogin;
