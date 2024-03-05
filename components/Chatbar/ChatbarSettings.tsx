import {
  IconLogout,
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
import HomeContext from '@/pages/home/home.context';
import { useRouter } from 'next/router';
import { UserRole } from '@/types/admin';
import { clearUserSession } from '@/utils/user';

export const ChatBarSettings = () => {
  const router = useRouter();
  const { t } = useTranslation('sidebar');
  const [isSettingDialogOpen, setIsSettingDialog] = useState<boolean>(false);

  const {
    state: { user, conversations },
  } = useContext(HomeContext);

  const { handleClearConversations } = useContext(ChatbarContext);

  const logout = () => {
    clearUserSession();
    router.push('/login');
  };

  return (
    <div className='flex flex-col items-center space-y-1 border-t border-white/20 pt-1 text-sm'>
      {conversations.length > 0 ? (
        <ClearConversations onClearConversations={handleClearConversations} />
      ) : null}

      {/* <SidebarButton
        text={t('Export data')}
        icon={<IconFileExport size={18} />}
        onClick={() => handleExportData()}
      /> */}

      <SidebarButton
        text={t('Settings')}
        icon={<IconSettings size={18} />}
        onClick={() => setIsSettingDialog(true)}
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

      {user?.username && (
        <SidebarButton
          text={user?.username}
          icon={<IconUser size={18} />}
          action={<IconLogout onClick={logout} size={18} />}
          onClick={() => {}}
        />
      )}

      <SettingDialog
        open={isSettingDialogOpen}
        onClose={() => {
          setIsSettingDialog(false);
        }}
      />
    </div>
  );
};
