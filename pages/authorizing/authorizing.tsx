import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';
import { NextApiRequest, NextApiResponse } from 'next';
import { saveUserSession, setUserSessionId } from '@/utils/user';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { DEFAULT_LANGUAGE } from '@/types/settings';
import { useTranslation } from 'react-i18next';

export default function Authorizing(props: { session: any }) {
  const { t } = useTranslation('login');
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  useEffect(() => {
    setIsClient(true);
    const { session } = props;
    if (!session) {
      router.push('/login');
      return;
    }
    setUserSessionId(session.sessionId);
    saveUserSession({
      ...session,
    });
    router.push('/');
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
