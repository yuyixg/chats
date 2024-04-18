import {
  IconLogout,
  IconMoneybag,
  IconPasswordUser,
  IconSettings,
  IconUser,
  IconUserCog,
} from '@tabler/icons-react';
import { useContext, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { SettingDialog } from '@/components/Settings/SettingDialog';

import { SidebarButton } from '../Sidebar/SidebarButton';
// import ChatbarContext from '../Chatbar.context';
import { ClearConversations } from './ClearConversations';
import ChatbarContext from './Chatbar.context';
import { useRouter } from 'next/router';
import { UserRole } from '@/types/admin';
import {
  clearUserSession,
  getLoginUrl,
  clearUserSessionId,
} from '@/utils/user';
import { HomeContext } from '@/pages/home/home';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Separator } from '../ui/separator';
import { ChangePasswordModal } from '../Sidebar/ChangePasswordModal';
import { RechargeModal } from '../UserRecharge/RechargeModal';

export const ChatBarSettings = () => {
  const router = useRouter();
  const { t } = useTranslation('sidebar');
  const [isSettingModalOpen, setIsSettingModal] = useState<boolean>(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModal] =
    useState<boolean>(false);
  const [isRechargeModalOpen, setIsRechargeModal] = useState<boolean>(false);

  const {
    state: { user, conversations },
  } = useContext(HomeContext);

  const { handleClearConversations } = useContext(ChatbarContext);

  const logout = () => {
    clearUserSessionId();
    clearUserSession();
    router.push(getLoginUrl());
  };

  return (
    <div className='flex flex-col items-center space-y-1 border-t border-white/20 pt-1 text-sm'>
      {/* {conversations.length > 0 ? (
        <ClearConversations onClearConversations={handleClearConversations} />
      ) : null} */}

      {/* <SidebarButton
        text={t('Export data')}
        icon={<IconFileExport size={18} />}
        onClick={() => handleExportData()}
      /> */}

      <SidebarButton
        text={t('Settings')}
        icon={<IconSettings size={18} />}
        onClick={() => setIsSettingModal(true)}
      />

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
          <PopoverTrigger className='w-full'>
            <SidebarButton
              className='capitalize'
              text={user?.username}
              icon={<IconUser size={18} />}
              onClick={() => {}}
            />
          </PopoverTrigger>
          <PopoverContent className='w-[244px]'>
            <SidebarButton
              text={t('Change Password')}
              icon={<IconPasswordUser size={18} />}
              onClick={() => {
                setIsChangePasswordModal(true);
              }}
            />
            <Separator className='my-2' />
            <SidebarButton
              text={t('Log out')}
              icon={<IconLogout size={18} />}
              onClick={logout}
            />
          </PopoverContent>
        </Popover>
      )}

      {isSettingModalOpen && (
        <SettingDialog
          isOpen={isSettingModalOpen}
          onClose={() => {
            setIsSettingModal(false);
          }}
        />
      )}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => {
          setIsChangePasswordModal(false);
        }}
        onSuccessful={() => {
          setIsChangePasswordModal(false);
          logout();
        }}
      />

      {isRechargeModalOpen && (
        <RechargeModal
          isOpen={isRechargeModalOpen}
          onClose={() => {
            setIsRechargeModal(false);
          }}
        />
      )}
    </div>
  );
};
