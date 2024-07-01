import { useContext, useState } from 'react';

import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import { clearUserInfo, clearUserSession, getLoginUrl } from '@/utils/user';
import { hasContact } from '@/utils/website';

import { UserRole } from '@/types/admin';

import { HomeContext } from '@/pages/home/home';

import {
  IconAddress,
  IconBulbFilled,
  IconLogout,
  IconMoneybag,
  IconSettings,
  IconUser,
  IconUserCog,
} from '@/components/Icons/index';

import ContactModal from '../Sidebar/ContactModal';
import SettingsModal from '../Sidebar/SettingsModal';
import { SidebarButton } from '../Sidebar/SidebarButton';
import { RechargeModal } from '../UserRecharge/RechargeModal';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Separator } from '../ui/separator';

export const ChatBarSettings = () => {
  const router = useRouter();
  const { t } = useTranslation('sidebar');
  const [isSettingModalOpen, setIsSettingModal] = useState<boolean>(false);
  const [isRechargeModalOpen, setIsRechargeModal] = useState<boolean>(false);
  const [isContactModalOpen, setIsContactModal] = useState<boolean>(false);

  const {
    state: { user },
    dispatch: homeDispatch,
    handleUpdateSettings,
  } = useContext(HomeContext);

  const logout = () => {
    clearUserSession();
    clearUserInfo();
    router.push(getLoginUrl());
  };

  return (
    <div className="flex flex-col items-center space-y-1 border-t border-black/5 dark:border-white/10 pt-2 text-sm">
      {/* {conversations.length > 0 ? (
        <ClearConversations onClearConversations={handleClearConversations} />
      ) : null} */}

      {/* <SidebarButton
        text={t('Export data')}
        icon={<IconFileExport size={18} />}
        onClick={() => handleExportData()}
      /> */}
      {user?.role === UserRole.admin && (
        <SidebarButton
          text={t('Admin Panel')}
          icon={<IconUserCog size={18} />}
          onClick={() => {
            router.push('/admin/dashboard');
          }}
        />
      )}

      {user?.canRecharge && (
        <SidebarButton
          text={t('账号充值')}
          icon={<IconMoneybag size={18} />}
          onClick={() => setIsRechargeModal(true)}
        />
      )}

      {user?.username && (
        <Popover>
          <PopoverTrigger className="w-full">
            <SidebarButton
              className="capitalize"
              text={user?.username}
              icon={<IconUser size={18} />}
              onClick={() => {}}
            />
          </PopoverTrigger>
          <PopoverContent className="w-[244px]">
            <SidebarButton
              text={t('Prompt Management')}
              icon={<IconBulbFilled size={18} />}
              onClick={() => {
                handleUpdateSettings('showPromptBar', true);
              }}
            />
            <SidebarButton
              text={t('Account Settings')}
              icon={<IconSettings size={18} />}
              onClick={() => setIsSettingModal(true)}
            />
            {hasContact() && (
              <SidebarButton
                text={t('Contact')}
                icon={<IconAddress size={18} />}
                onClick={() => setIsContactModal(true)}
              />
            )}
            <Separator className="my-2" />
            <SidebarButton
              text={t('Log out')}
              icon={<IconLogout size={18} />}
              onClick={logout}
            />
          </PopoverContent>
        </Popover>
      )}

      {isSettingModalOpen && (
        <SettingsModal
          isOpen={isSettingModalOpen}
          onClose={() => {
            setIsSettingModal(false);
          }}
        />
      )}

      {isRechargeModalOpen && (
        <RechargeModal
          isOpen={isRechargeModalOpen}
          onClose={() => {
            setIsRechargeModal(false);
          }}
        />
      )}

      {isContactModalOpen && (
        <ContactModal
          isOpen={isContactModalOpen}
          onClose={() => {
            setIsContactModal(false);
          }}
        />
      )}
    </div>
  );
};
