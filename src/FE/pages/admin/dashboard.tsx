import React, { useEffect, useState } from 'react';

import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { DEFAULT_LANGUAGE } from '@/utils/settings';
import { getUserInfo } from '@/utils/user';

const Dashboard = () => {
  const { t } = useTranslation('admin');
  const [name, setName] = useState('');
  useEffect(() => {
    setName(getUserInfo()?.username || '');
  }, []);

  return (
    <div className="font-semibold text-lg">
      {t('Welcome back.')}
      {name}
    </div>
  );
};

export default Dashboard;

export const getServerSideProps = async ({ locale }: any) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? DEFAULT_LANGUAGE, ['admin'])),
    },
  };
};
