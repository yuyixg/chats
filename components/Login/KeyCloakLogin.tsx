import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import Image from 'next/image';
import { getCsrfToken } from '@/apis/userService';

const KeyCloakLogin = (props: { loading?: boolean }) => {
  const { loading } = props;
  const [csrfToken, setCsrfToken] = useState<string>('');
  useEffect(() => {
    getCsrfToken().then((data) => {
      setCsrfToken(data?.csrfToken);
    });
  }, []);

  return (
    <form action='/api/auth/signin/keycloak' method='POST'>
      <input type='hidden' name='csrfToken' value={csrfToken} />
      <input
        type='hidden'
        name='callbackUrl'
        value={`${location.origin}/authorizing`}
      />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className='p-0 w-8 h-8'
              disabled={loading}
              variant='link'
              type='submit'
            >
              <Image
                src='/keycloak.svg'
                alt='KeyCloak'
                width={32}
                height={32}
                className='h-8 w-8 rounded-md dark:bg-white'
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>KeyCloak</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </form>
  );
};
export default KeyCloakLogin;
