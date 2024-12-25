import { useContext } from 'react';

import useTranslation from '@/hooks/useTranslation';

import { ChatSpanDto } from '@/types/clientApis';
import { Prompt } from '@/types/prompt';

import TemperatureSlider from '@/components/TemperatureSlider/TemperatureSlider';

import { setSelectedChat } from '../../_actions/chat.actions';
import HomeContext from '../../_contexts/home.context';
import ChatModelInfo from './ChatModelInfo';
import EnableNetworkSearch from './EnableNetworkSearch';
import SystemPrompt from './SystemPrompt';

import { putUserChatSpan } from '@/apis/clientApis';

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
    chatDispatch,
  } = useContext(HomeContext);

  const onChangePrompt = (prompt: Prompt) => {
    if (prompt.temperature !== null) {
      // userModelConfigDispatch(setTemperature(prompt.temperature));
    }
  };

  type SpanConfig = {
    prompt: string;
    temperature: number;
    enableSearch: boolean;
  };
  type SpanConfigHandlers = {
    [K in keyof SpanConfig]: (spanId: number, value: SpanConfig[K]) => void;
  };

  const updateSpanField = <T extends keyof SpanConfig>(
    spanId: number,
    key: T,
    value: SpanConfig[T],
  ) => {
    const spans = selectedChat.spans.map((s) =>
      s.spanId === spanId ? { ...s, [key]: value } : s,
    );
    // if (key !== 'prompt') {
    //   await putUserChatSpan(selectedChat.id, spanId, { [key]: value });
    // }
    chatDispatch(setSelectedChat({ ...selectedChat, spans }));
  };

  const spanConfigHandlers: SpanConfigHandlers = {
    prompt: (spanId, value) => updateSpanField(spanId, 'prompt', value),
    temperature: (spanId, value) =>
      updateSpanField(spanId, 'temperature', value),
    enableSearch: (spanId, value) =>
      updateSpanField(spanId, 'enableSearch', value),
  };
  const onChangePromptText = (spanId: number, value: string) => {
    const spans = selectedChat.spans.map((s) =>
      s.spanId === spanId ? { ...s, prompt: value } : s,
    );
    chatDispatch(setSelectedChat({ ...selectedChat, spans }));
  };
  const onChangeTemperature = (spanId: number, value: number) => {
    const spans = selectedChat.spans.map((s) =>
      s.spanId === spanId ? { ...s, temperature: value } : s,
    );
    chatDispatch(setSelectedChat({ ...selectedChat, spans }));
  };
  const onChangeEnableSearch = (spanId: number, value: boolean) => {
    const spans = selectedChat.spans.map((s) =>
      s.spanId === spanId ? { ...s, enableSearch: value } : s,
    );
    chatDispatch(setSelectedChat({ ...selectedChat, spans }));
  };

  return (
    <div className="mx-auto px-12">
      {hasModel() && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(375px,1fr))] gap-4">
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
                      spanConfigHandlers.prompt(span.spanId, value);
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
                        spanConfigHandlers.temperature(span.spanId, value);
                      }}
                    />
                  )}
                {selectModel?.allowSearch && enableSearch != undefined && (
                  <EnableNetworkSearch
                    label={t('Internet Search')}
                    enable={enableSearch}
                    onChange={(value) => {
                      spanConfigHandlers.enableSearch(span.spanId, value);
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
