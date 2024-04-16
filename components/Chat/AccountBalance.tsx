import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { HomeContext } from '@/pages/home/home';
import { formatRMB } from '@/utils/common';
import { getUserBalance } from '@/apis/userService';

export const AccountBalance = () => {
  const { t } = useTranslation('chat');
  const [balance, setBalance] = useState(0);
  const {
    state: { selectedConversation },
  } = useContext(HomeContext);

  useEffect(() => {
    getUserBalance().then((data) => {
      setBalance(data);
    });
  }, [selectedConversation]);

  return (
    <div className='flex flex-col'>
      <label className='mb-2 text-left text-neutral-700 dark:text-neutral-400'>
        {t('Account Balance')}
      </label>
      <div className='w-full focus:outline-none active:outline-none bg-transparent pr-2 text-neutral-900 dark:border-neutral-600 dark:text-white font-semibold'>
        {formatRMB(balance)}
      </div>
    </div>
  );
};
