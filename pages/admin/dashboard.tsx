import React, { useEffect, useState } from 'react';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { getSession } from '@/utils/session';
import { getUserInfo } from '@/utils/user';

import { UserRole } from '@/types/admin';
import { DEFAULT_LANGUAGE } from '@/types/settings';

const Dashboard = () => {
  const [name, setName] = useState('');
  useEffect(() => {
    setName(getUserInfo()?.username || '');
  }, []);

  return <div className="font-semibold text-lg">欢迎回来，{name}</div>;
};

export default Dashboard;

export const getServerSideProps = async ({ locale, req }: any) => {
  let session = await getSession(req.cookies);
  if (!session || session.role != UserRole.admin) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
  return {
    props: {
      ...(await serverSideTranslations(locale ?? DEFAULT_LANGUAGE, [
        'common',
        'admin',
      ])),
    },
  };
};
