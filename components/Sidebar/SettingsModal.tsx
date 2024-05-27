import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useTranslation } from 'next-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { IconMoneybag, IconPasswordUser, IconSettings } from '../Icons';
import { ChangePasswordTabContent } from './ChangePasswordTabContent';
import SettingsTabContent from './SettingsTabCotent';
import { useState } from 'react';
import UserBalanceTabContent from './UserBalanceTabContent';

interface IProps {
  isOpen: boolean;
  onClose: () => void;
}

enum TabKey {
  Balance = 'Balance',
  Settings = 'Settings',
  ChangePassword = 'ChangePassword',
}

const SettingsModal = (props: IProps) => {
  const { t } = useTranslation('sidebar');
  const { isOpen, onClose } = props;
  const [currentTab, setCurrentTab] = useState(TabKey.Settings);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='w-1/2'>
        <DialogHeader className='mb-[16px]'>
          <DialogTitle>{t('Account Settings')}</DialogTitle>
        </DialogHeader>
        <Tabs
          defaultValue={TabKey.Settings}
          orientation='horizontal'
          className='w-1/2 p-0 m-0'
        >
          <TabsList className='bg-transparent min-w-[160px] gap-2 p-0 m-0'>
            <TabsTrigger
              value={TabKey.Settings}
              onClick={() => setCurrentTab(TabKey.Settings)}
              className='flex w-full data-[state=active]:bg-[#ececec] data-[state=active]:dark:bg-[#343541]/90 data-[state=active]:shadow-none'
            >
              <div className='flex gap-1'>
                <IconSettings /> {t('General')}
              </div>
            </TabsTrigger>
            <TabsTrigger
              value={TabKey.Balance}
              onClick={() => setCurrentTab(TabKey.Balance)}
              className='flex w-full data-[state=active]:bg-[#ececec] data-[state=active]:dark:bg-[#343541]/90 data-[state=active]:shadow-none'
            >
              <div className='flex gap-1'>
                <IconMoneybag /> {t('Account balance')}
              </div>
            </TabsTrigger>
            <TabsTrigger
              value={TabKey.ChangePassword}
              onClick={() => setCurrentTab(TabKey.ChangePassword)}
              className='flex w-full data-[state=active]:bg-[#ececec] data-[state=active]:dark:bg-[#343541]/90 data-[state=active]:shadow-none'
            >
              <div className='flex gap-1'>
                <IconPasswordUser /> {t('Change Password')}
              </div>
            </TabsTrigger>
          </TabsList>
          <TabsContent className='min-w-full mt-[-4px]' value={TabKey.Settings}>
            <SettingsTabContent />
          </TabsContent>
          <TabsContent className='min-w-full mt-[4px]' value={TabKey.Balance}>
            <UserBalanceTabContent />
          </TabsContent>
          <TabsContent
            className='min-w-full mt-[-4px]'
            value={TabKey.ChangePassword}
          >
            <ChangePasswordTabContent />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
