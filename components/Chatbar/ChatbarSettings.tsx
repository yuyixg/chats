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
import { signOut, useSession } from 'next-auth/react';
import ChatbarContext from './Chatbar.context';
import HomeContext from '@/pages/api/home/home.context';
import { useRouter } from 'next/router';
import { UserRole } from '@/types/admin';

export const ChatBarSettings = () => {
  const router = useRouter();
  const { t } = useTranslation('sidebar');
  const [isSettingDialogOpen, setIsSettingDialog] = useState<boolean>(false);
  const { data: session } = useSession();

  const {
    state: { conversations },
  } = useContext(HomeContext);

  const { handleClearConversations } = useContext(ChatbarContext);

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

      {session?.role === UserRole.admin && (
        <SidebarButton
          text={t('Admin Panel')}
          icon={<IconUserCog size={18} />}
          onClick={() => {
            router.push('/admin');
          }}
        />
      )}

      {session?.user.name && (
        <SidebarButton
          text={session?.user.name}
          icon={<IconUser size={18} />}
          action={
            <IconLogout
              onClick={() => {
                signOut();
              }}
              size={18}
            />
          }
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
