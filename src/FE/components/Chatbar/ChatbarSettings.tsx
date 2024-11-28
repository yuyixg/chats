import { useContext, useState } from 'react';

import useTranslation from '@/hooks/useTranslation';
import { useRouter } from 'next/router';

import { clearUserInfo, clearUserSession, getLoginUrl } from '@/utils/user';

import { UserRole } from '@/types/adminApis';

import { HomeContext } from '@/pages/home';

import {
  IconBulbFilled,
  IconKey,
  IconLogout,
  IconMoneybag,
  IconPasswordUser,
  IconUser,
  IconUserCog,
} from '@/components/Icons/index';
import { ChangePasswordModal } from '@/components/Modal/ChangePasswordModal';
import UserBalanceModal from '@/components/Modal/UserBalanceModal';
import { SettingModal } from '@/components/Settings/SettingModal';
import { SidebarButton } from '@/components/Sidebar/SidebarButton';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

import { getUserBalanceOnly } from '@/apis/clientApis';

export const ChatBarSettings = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [changePwdModalOpen, setChangePwdModalOpen] = useState<boolean>(false);
  const [userBalanceModalOpen, setUserBalanceModalOpen] =
    useState<boolean>(false);
  const [settingSheetOpen, setSettingSheetOpen] = useState<boolean>(false);

  const {
    state: {
      user,
      settings: { showPromptBar },
    },
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
            router.push('/admin');
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
            <Separator className="my-2" />
            <SidebarButton
              text={t('Prompt Management')}
              icon={<IconBulbFilled size={18} />}
              onClick={() => {
                handleUpdateSettings('showPromptBar', !showPromptBar);
              }}
            />
            <SidebarButton
              text={`${t('API Key Management')}`}
              icon={<IconKey size={18} />}
              onClick={() => {
                setSettingSheetOpen(true);
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

      <SettingModal
        isOpen={settingSheetOpen}
        onClose={() => {
          setSettingSheetOpen(false);
        }}
      />
    </div>
  );
};
