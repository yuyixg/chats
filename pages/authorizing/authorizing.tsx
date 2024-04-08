import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';
import { NextApiRequest, NextApiResponse } from 'next';
import { saveUserSession, setUserSessionId } from '@/utils/user';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { DEFAULT_LANGUAGE } from '@/types/settings';
import { useTranslation } from 'react-i18next';
import { singIn } from '@/apis/userService';
import toast from 'react-hot-toast';

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
    if (session) {
      setUserSessionId(session.sessionId);
      saveUserSession({
        ...session,
      });
      router.push('/');
    } else if (code) {
      singIn({ code })
        .then((response) => {
          setUserSessionId(response.sessionId);
          saveUserSession({
            ...response,
          });
          router.push('/');
        })
        .catch(() => {
          toast.error(t('授权失败,请稍后再试'));
        });
    }
  }, []);
  return (
    <>
      {isClient && (
        <div className='w-full text-center mt-8 text-gray-600'>
          {t('Authorizing...')}
        </div>
      )}
    </>
  );
}

export const getServerSideProps = async ({
  req,
  res,
  locale,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
  locale: string;
}) => {
  const session = await getServerSession(req, res, authOptions);
  return {
    props: {
      session,
      ...(await serverSideTranslations(locale ?? DEFAULT_LANGUAGE, ['login'])),
    },
  };
};
