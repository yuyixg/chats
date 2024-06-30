import { getSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { NextApiRequest } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';

import { saveUserInfo, setUserSession } from '@/utils/user';

import { DEFAULT_LANGUAGE } from '@/types/settings';

import { singIn } from '@/apis/userService';

export default function Authorizing(props: { session: any }) {
  const { t } = useTranslation('login');
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { code } = router.query as { code: string };
  useEffect(() => {
    setIsClient(true);
    const { session } = props;
    if (!session && !code) {
      router.push('/login');
      return;
    }
    if (code) {
      singIn({ code })
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
    } else if (session) {
      setUserSession(session.sessionId);
      saveUserInfo({
        ...session,
      });
      router.push('/');
    }
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
  const session = await getSession({ req });
  return {
    props: {
      session,
      ...(await serverSideTranslations(locale ?? DEFAULT_LANGUAGE, ['login'])),
    },
  };
};
