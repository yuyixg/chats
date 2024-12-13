import { useContext, useState } from 'react';

import { IconX } from '@/components/Icons';

import HomeContext from '../../_reducers/Home.context';
import SliderSetting from './SliderSetting';

const ChatSettingsBar = () => {
  const {
    state: { settings },
    handleUpdateSettings,
  } = useContext(HomeContext);

  const [options, setOptions] = useState<{ temperature: number | null }>({
    temperature: null,
  });

  return (
    <div
      className={`${
        settings.showChatSettingBar ? 'w-[360px]' : 'w-0 hidden'
      } fixed top-0 right-0 z-40 flex h-full flex-none flex-col bg-background p-2 text-[14px] sm:relative sm:top-0`}
    >
      <div className="">
        <div className="flex w-full justify-between h-9 items-center px-2">
          <span className="text-lg font-bold">Chat Settings</span>
          <span
            onClick={() => {
              handleUpdateSettings('showChatSettingBar', false);
            }}
          >
            <IconX />
          </span>
        </div>
        <div className="p-2">
          <SliderSetting
            name="Temperature"
            defaultValue={1}
            value={options.temperature === null ? 'Default' : 'Custom'}
            onChange={(value) => {
              setOptions({
                ...options,
                temperature: value === 'Default' ? null : 0,
              });
            }}
            onValueChange={(value) => {
              setOptions({ ...options, temperature: value });
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatSettingsBar;
