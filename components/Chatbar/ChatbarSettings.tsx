import { IconLogout, IconSettings, IconUser } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { SettingDialog } from '@/components/Settings/SettingDialog';

import { SidebarButton } from '../Sidebar/SidebarButton';
// import ChatbarContext from '../Chatbar.context';
import { ClearConversations } from './ClearConversations';
import { signOut, useSession } from 'next-auth/react';

export const ChatBarSettings = () => {
  const { t } = useTranslation('sidebar');
  const [isSettingDialogOpen, setIsSettingDialog] = useState<boolean>(false);
  const { data: session } = useSession();

  //   const {
  //     handleClearConversations
  //   } = useContext(ChatbarContext);

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
        onClick={() => setIsSettingDialog(true)}
      />

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
