import { useContext } from 'react';

import useTranslation from '@/hooks/useTranslation';

import { Prompt } from '@/types/prompt';

import TemperatureSlider from '@/components/TemperatureSlider/TemperatureSlider';

import HomeContext from '../../_contexts/home.context';
import ChatModelInfo from './ChatModelInfo';
import EnableNetworkSearch from './EnableNetworkSearch';
import SystemPrompt from './SystemPrompt';

const ChatModelSetting = () => {
  const { t } = useTranslation();
  const {
    state: {
      prompt,
      temperature,
      enableSearch,

      selectedChat,

      selectModel,

      prompts,
    },
    hasModel,
  } = useContext(HomeContext);

  const onChangePrompt = (prompt: Prompt) => {
    if (prompt.temperature !== null) {
      // userModelConfigDispatch(setTemperature(prompt.temperature));
    }
  };

  return (
    <div className="mx-auto flex flex-col items-center space-y-5 md:space-y-10 px-3 pt-[52px] pb-16 md:pb-0">
      {hasModel() && (
        <div className="grid grid-flow-row md:grid-flow-col gap-6">
          {selectedChat.spans.map((span) => {
            return (
              <div
                key={'chat-model-' + span.spanId}
                className="space-y-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-600"
              >
                <ChatModelInfo
                  modelId={span.modelId}
                  modelName={span.modelName}
                />
                {selectModel?.allowSystemPrompt && prompt && (
                  <SystemPrompt
                    currentPrompt={prompt}
                    prompts={prompts}
                    model={selectModel}
                    onChangePromptText={(value) => {
                      // userModelConfigDispatch(setPrompt(value));
                    }}
                    onChangePrompt={onChangePrompt}
                  />
                )}
                {selectModel?.allowTemperature &&
                  temperature !== null &&
                  temperature !== undefined && (
                    <TemperatureSlider
                      label={t('Temperature')}
                      min={0}
                      max={1}
                      defaultTemperature={temperature}
                      onChangeTemperature={(value) => {
                        // userModelConfigDispatch(setTemperature(value))
                      }}
                    />
                  )}
                {selectModel?.allowSearch && enableSearch != undefined && (
                  <EnableNetworkSearch
                    label={t('Internet Search')}
                    enable={enableSearch}
                    onChange={(value) => {
                      // userModelConfigDispatch(setEnableSearch(value));
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChatModelSetting;
