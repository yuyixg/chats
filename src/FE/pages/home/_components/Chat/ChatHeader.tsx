import { useContext } from 'react';

import useTranslation from '@/hooks/useTranslation';

import ChangeChatModelDropdownMenu from '@/components/ChangeModel/ChangeModel';
import { IconMinus } from '@/components/Icons';
import Tips from '@/components/Tips/Tips';
import { Button } from '@/components/ui/button';

import { setSelectedChat } from '../../_actions/chat.actions';
import HomeContext from '../../_contexts/home.context';
import ModeToggle from '../ModeToggle/ModeToggle';

import {
  deleteUserChatSpan,
  postUserChatSpan,
  putUserChatSpan,
} from '@/apis/clientApis';
import { cn } from '@/lib/utils';

const ChatHeader = () => {
  const { t } = useTranslation();
  const MAX_SELECT_MODEL_COUNT = 10;
  const {
    state: {
      selectedChat,
      models,

      defaultPrompt,
      showChatBar,
    },
    chatDispatch,
  } = useContext(HomeContext);

  const handleAddChatModel = async (modelId: number) => {
    await postUserChatSpan(selectedChat.id, { modelId }).then((data) => {
      selectedChat.spans.push({
        spanId: data.spanId,
        modelId: data.modelId,
        modelName: data.modelName,
        modelProviderId: data.modelProviderId,
        temperature: data.temperature,
        enableSearch: data.enableSearch,
        prompt: defaultPrompt?.content!,
      });
      chatDispatch(setSelectedChat(selectedChat));
    });
  };

  const handleRemoveChatModel = async (spanId: number) => {
    await deleteUserChatSpan(selectedChat.id, spanId).then(() => {
      selectedChat.spans = selectedChat.spans.filter(
        (s) => s.spanId !== spanId,
      );
      chatDispatch(setSelectedChat(selectedChat));
    });
  };

  const handleUpdateChatModel = async (spanId: number, modelId: number) => {
    await putUserChatSpan(selectedChat.id, spanId, { modelId }).then((data) => {
      selectedChat.spans = selectedChat.spans.map((s) => {
        if (s.spanId === spanId) {
          return {
            ...s,
            modelId: data.modelId,
            modelName: data.modelName,
            modelProviderId: data.modelProviderId,
            temperature: data.temperature,
            enableSearch: data.enableSearch,
          };
        }
        return s;
      });
      chatDispatch(setSelectedChat(selectedChat));
    });
  };

  return (
    <div className="sticky top-0 pt-1 z-10 text-sm bg-background right-0">
      <div className="flex justify-between h-auto">
        <div className={cn('flex justify-start ml-24', showChatBar && 'ml-6')}>
          <div className="flex flex-col gap-y-1">
            <div>
              {selectedChat.spans.length < MAX_SELECT_MODEL_COUNT && (
                <ChangeChatModelDropdownMenu
                  models={models}
                  className="font-semibold text-base"
                  content={t('Add another model')}
                  onChangeModel={(model) => {
                    handleAddChatModel(model.modelId);
                  }}
                />
              )}
            </div>
            <div className="flex flex-col gap-x-1">
              {selectedChat.spans.map((span) => (
                <div className="flex" key={'chat-header-' + span.spanId}>
                  <ChangeChatModelDropdownMenu
                    key={'change-model-' + span.modelId}
                    models={models}
                    modelName={span.modelName}
                    className="font-semibold text-base"
                    content={span?.modelName}
                    onChangeModel={(model) => {
                      handleUpdateChatModel(span.spanId, model.modelId);
                    }}
                  />

                  <div hidden={selectedChat.spans.length === 1}>
                    <Tips
                      trigger={
                        <Button
                          onClick={() => {
                            handleRemoveChatModel(span.spanId);
                          }}
                          variant="ghost"
                          className="p-1 m-0 h-auto"
                        >
                          <IconMinus />
                        </Button>
                      }
                      content={t('Remove')}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mr-2 md:mr-4">{<ModeToggle />}</div>
      </div>
    </div>
  );
};

export default ChatHeader;
