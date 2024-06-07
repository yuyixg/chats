import { useState } from 'react';

import { useTranslation } from 'next-i18next';
import Image from 'next/image';

import { Button } from '../ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import AccountLoginModal from './AccountLoginModal';

const AccountLogin = (props: { loading?: boolean }) => {
  const { t } = useTranslation('login');
  const { loading } = props;

  const [isOpen, setIsOpen] = useState(false);

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
                src="/account.svg"
                alt="Phone"
                width={0}
                height={0}
                className="h-7 w-7 dark:bg-transparent"
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('Account password login')}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <AccountLoginModal onClose={() => setIsOpen(false)} isOpen={isOpen} />
    </div>
  );
};
export default AccountLogin;
