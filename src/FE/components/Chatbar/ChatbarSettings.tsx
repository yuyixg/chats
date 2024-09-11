import { useContext, useState } from 'react';

import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import { clearUserInfo, clearUserSession, getLoginUrl } from '@/utils/user';

import { UserRole } from '@/types/admin';

import { HomeContext } from '@/pages/home/home';

import {
  IconBulbFilled,
  IconLogout,
  IconMoneybag,
  IconPasswordUser,
  IconUser,
  IconUserCog,
} from '@/components/Icons/index';

import { ChangePasswordModal } from '../ChangePasswordModal/ChangePasswordModal';
import { SidebarButton } from '../Sidebar/SidebarButton';
import UserBalanceModal from '../UserBalanceModal/UserBalanceModal';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Separator } from '../ui/separator';

import { getUserBalanceOnly } from '@/apis/userService';

export const ChatBarSettings = () => {
  const router = useRouter();
  const { t } = useTranslation('sidebar');
  const [changePwdModalOpen, setChangePwdModalOpen] = useState<boolean>(false);
  const [userBalanceModalOpen, setUserBalanceModalOpen] =
    useState<boolean>(false);

  const {
    state: { user },
    handleUpdateSettings,
  } = useContext(HomeContext);

  const [userBalance, setUserBalance] = useState<number>(0);
  const logout = () => {
    clearUserSession();
    clearUserInfo();
    router.push(getLoginUrl());
  };

  const getUserBalance = () => {
    getUserBalanceOnly().then((data) => setUserBalance(data));
  };

  const handleClickUserMore = () => {
    getUserBalance();
  };

  return (
    <div className="flex flex-col items-center space-y-1 border-t border-black/5 dark:border-white/10 pt-2 text-sm">
      {user?.role === UserRole.admin && (
        <SidebarButton
          text={t('Admin Panel')}
          icon={<IconUserCog size={18} />}
          onClick={() => {
            router.push('/admin/dashboard');
          }}
        />
      )}

      {user?.username && (
        <Popover>
          <PopoverTrigger className="w-full">
            <SidebarButton
              className="capitalize"
              text={user?.username}
              icon={<IconUser size={18} />}
              onClick={handleClickUserMore}
            />
          </PopoverTrigger>
          <PopoverContent className="w-[244px]">
            <SidebarButton
              text={`${t('Account balance')}￥${(+(userBalance || 0)).toFixed(
                2,
              )}`}
              icon={<IconMoneybag size={18} />}
              onClick={() => {
                setUserBalanceModalOpen(true);
              }}
            />
            <SidebarButton
              text={t('Prompt Management')}
              icon={<IconBulbFilled size={18} />}
              onClick={() => {
                handleUpdateSettings('showPromptBar', true);
              }}
            />
            <Separator className="my-2" />
            <SidebarButton
              text={t('Change Password')}
              icon={<IconPasswordUser size={18} />}
              onClick={() => {
                setChangePwdModalOpen(true);
              }}
            />
            <SidebarButton
              text={t('Log out')}
              icon={<IconLogout size={18} />}
              onClick={logout}
            />
          </PopoverContent>
        </Popover>
      )}

      {userBalanceModalOpen && (
        <UserBalanceModal
          isOpen={userBalanceModalOpen}
          onClose={() => {
            setUserBalanceModalOpen(false);
          }}
        />
      )}

      {changePwdModalOpen && (
        <ChangePasswordModal
          isOpen={changePwdModalOpen}
          onClose={() => {
            setChangePwdModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
