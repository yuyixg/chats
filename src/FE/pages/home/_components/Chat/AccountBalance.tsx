import { useContext, useEffect, useState } from 'react';

import useTranslation from '@/hooks/useTranslation';

import { formatRMB } from '@/utils/common';

import { HomeContext } from '@/pages/home/_contents/Home.context';

import { getUserBalanceOnly } from '@/apis/clientApis';

export const AccountBalance = () => {
  const { t } = useTranslation();
  const [balance, setBalance] = useState(0);
  const {
    state: {},
  } = useContext(HomeContext);

  useEffect(() => {
    getUserBalanceOnly().then((data) => {
      setBalance(data);
    });
  }, []);

  return (
    <div className="flex flex-col">
      <label className="mb-2 text-left text-neutral-700 dark:text-neutral-400">
        {t('Account Balance')}
      </label>
      <div className="w-full focus:outline-none active:outline-none bg-transparent pr-2 text-neutral-900 dark:border-neutral-600 dark:text-white font-semibold">
        {formatRMB(balance)}
      </div>
    </div>
  );
};
