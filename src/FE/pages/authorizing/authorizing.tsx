import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { NextApiRequest } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';

import { DEFAULT_LANGUAGE } from '@/utils/settings';
import { saveUserInfo, setUserSession } from '@/utils/user';

import { singIn } from '@/apis/userService';

export default function Authorizing() {
  const { t } = useTranslation('login');
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { code, provider } = router.query as { code: string; provider: string };
  useEffect(() => {
    setIsClient(true);
    if (!code) {
      router.push('/login');
      return;
    }
    singIn({
      code,
      provider,
    })
      .then((response) => {
        setUserSession(response.sessionId);
        saveUserInfo({
          ...response,
        });
        router.push('/');
      })
      .catch(() => {
        toast.error(t('授权失败,请稍后再试'));
      });
  }, []);
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

export const getServerSideProps = async ({
  req,
  locale,
}: {
  req: NextApiRequest;
  locale: string;
}) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? DEFAULT_LANGUAGE, ['login'])),
    },
  };
};
