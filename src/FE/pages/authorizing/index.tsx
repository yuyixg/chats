import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import useTranslation from '@/hooks/useTranslation';

import { saveUserInfo, setUserSession } from '@/utils/user';

import { singIn } from '@/apis/clientApis';

export default function Authorizing() {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const [everStarted, setEverStarted] = useState(false);

  useEffect(() => {
    const { code, provider } = router.query as {
      code: string;
      provider: string;
    };
    if (!router.isReady || everStarted) {
      return;
    }

    setEverStarted(true);
    setIsClient(true);
    if (!code) {
      router.push('/login');
      return;
    }
    singIn({
      code,
      provider,
    }).then((response) => {
      setUserSession(response.sessionId);
      saveUserInfo({
        ...response,
      });
      router.push('/');
    });
  }, [router.isReady]);
  return (
    <>
      {isClient && (
        <div className="w-full text-center mt-8 text-gray-600 text-[12.5px]">
          {t('Logging in...')}
        </div>
      )}
    </>
  );
}
