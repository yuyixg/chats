import React, { useEffect, useState } from 'react';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { DEFAULT_LANGUAGE } from '@/utils/settings';
import { getUserInfo } from '@/utils/user';

const Dashboard = () => {
  const [name, setName] = useState('');
  useEffect(() => {
    setName(getUserInfo()?.username || '');
  }, []);

  return <div className="font-semibold text-lg">欢迎回来，{name}</div>;
};

export default Dashboard;

export const getServerSideProps = async ({ locale }: any) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? DEFAULT_LANGUAGE, [
        'common',
        'admin',
      ])),
    },
  };
};
