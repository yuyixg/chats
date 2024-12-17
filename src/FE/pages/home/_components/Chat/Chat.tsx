import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import toast from 'react-hot-toast';

import useTranslation from '@/hooks/useTranslation';

import { getApiUrl } from '@/utils/common';
import { throttle } from '@/utils/throttle';
import { getUserSession } from '@/utils/user';

import { ChatBody, Content, ContentRequest, Message, Role } from '@/types/chat';
import { Prompt } from '@/types/prompt';

import ChangeModel from '@/components/ChangeModel/ChangeModel';
import TemperatureSlider from '@/components/TemperatureSlider/TemperatureSlider';

import { setMessageIsStreaming } from '../../_actions/chat.actions';
import {
  setCurrentMessages,
  setMessages,
} from '../../_actions/message.actions';
import { setSelectedModel } from '../../_actions/model.actions';
import {
  setEnableSearch,
  setPrompt,
  setTemperature,
  setUserModelConfig,
} from '../../_actions/userModelConfig.actions';
import HomeContext from '../../_contexts/home.context';
import ModeToggle from '../ModeToggle/ModeToggle';
import ChatInput from './ChatInput';
import EnableNetworkSearch from './EnableNetworkSearch';
import MemoizedChatMessage from './MemoizedChatMessage';
import ModelSelect from './ModelSelect';
import NoModel from './NoModel';
import SystemPrompt from './SystemPrompt';

import { getChat, putUserChatModel } from '@/apis/clientApis';
import { cn } from '@/lib/utils';
import { SseResponseKind, SseResponseLine } from '@/types/chatMessage';

const Chat = memo(() => {
  const { t } = useTranslation();

  const {
    state: {
      prompt,
      temperature,
      enableSearch,

      chats,
      selectChat,
      chatError,
      messageIsStreaming,

      selectMessages,
      currentChatMessageId,
      currentMessages,

      models,
      selectModel,

      prompts,
      showChatBar,
    },
    handleCreateNewChat,
    handleStartChat,
    handleChatIsError,
    handleUpdateChatStatus,
    handleUpdateChats,

    handleUpdateSelectMessage,
    handleUpdateCurrentMessage,
    hasModel,
    chatDispatch,
    messageDispatch,
    userModelConfigDispatch,
    modelDispatch,
  } = useContext(HomeContext);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);
  const [showScrollDownButton, setShowScrollDownButton] =
    useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const stopConversationRef = useRef<boolean>(false);

  const getSelectMessagesLast = () => {
    const selectMessageLength = selectMessages.length - 1;
    const lastMessage = { ...selectMessages[selectMessageLength] };
    return { lastMessage, selectMessageLength };
  };

  const handleSend = useCallback(
    async (
      message: Message,
      messageId: string,
      isRegenerate: boolean,
      modelId?: number,
    ) => {
      const isChatEmpty = selectMessages.length === 0;
      handleUpdateChatStatus(false);
      let selectChatId = selectChat?.id;
      let selectMessageList = [...selectMessages];
      let assistantParentId = messageId;
      if (!selectChatId) {
        const newChat = await handleCreateNewChat();
        selectChatId = newChat.id;
      }
      let selectedMessageId = messageId;
      if (messageId && isRegenerate) {
        const messageIndex = selectMessageList.findIndex(
          (x) => x.id === messageId,
        );
        selectMessageList.splice(messageIndex + 1, selectMessageList.length);
      } else {
        const messageTempId = 'userMessageTempId';
        assistantParentId = messageTempId;
        selectedMessageId = messageTempId;
        const parentMessage = selectMessageList.find((x) => x.id == messageId);
        parentMessage && parentMessage?.childrenIds.unshift(messageTempId);
        const parentMessageIndex = selectMessageList.findIndex(
          (x) => x.id == messageId,
        );
        const newUserMessage = {
          id: messageTempId,
          role: 'user' as Role,
          parentId: messageId,
          childrenIds: [],
          assistantChildrenIds: [],
          content: message.content,
          inputTokens: 0,
          outputTokens: 0,
          inputPrice: 0,
          outputPrice: 0,
        };
        let removeCount = -1;
        if (parentMessageIndex !== -1)
          removeCount = selectMessageList.length - 1;
        if (!messageId) {
          removeCount = selectMessageList.length;
          messageDispatch(
            setCurrentMessages([...currentMessages, newUserMessage]),
          );
        }

        selectMessageList.splice(
          parentMessageIndex + 1,
          removeCount,
          newUserMessage,
        );
      }

      const assistantMessageTempId = 'assistantMessageTempId';
      const newAssistantMessage = {
        id: assistantMessageTempId,
        role: 'assistant' as Role,
        parentId: assistantParentId,
        childrenIds: [],
        assistantChildrenIds: [],
        content: {
          image: [],
          text: '',
        },
        inputTokens: 0,
        outputTokens: 0,
        inputPrice: 0,
        outputPrice: 0,
      };

      selectMessageList.push(newAssistantMessage);
      handleStartChat(
        selectMessageList,
        selectedMessageId,
        assistantMessageTempId,
      );

      const messageContent: ContentRequest = {
        text: message.content.text!,
        fileIds: message.content.fileIds?.map((x) => x.id) || null,
      };

      const chatBody: ChatBody = {
        modelId: modelId || selectModel?.modelId!,
        chatId: selectChatId,
        messageId: messageId || null,
        userMessage: messageContent,
        userModelConfig: {
          prompt:
            selectModel && !selectModel.allowSystemPrompt && prompt
              ? null
              : prompt,
          temperature,
          enableSearch,
        },
      };
      let body = JSON.stringify(chatBody);

      const controller = new AbortController();
      const response = await fetch(`${getApiUrl()}/api/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getUserSession()}`,
        },
        signal: controller.signal,
        body,
      });

      const data = response.body;
      if (!response.ok) {
        handleChatIsError();
        const result = await response.json();
        toast.error(t(result?.message) || response.statusText);
        return;
      }
      if (!data) {
        handleChatIsError();
        return;
      }

      let errorChat = false;
      let text = '';
      const reader = data.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      function setSelectMessages(content: Content) {
        let lastMessages = selectMessageList[selectMessageList.length - 1];
        lastMessages = {
          ...lastMessages,
          content,
        };

        selectMessageList.splice(-1, 1, lastMessages);

        messageDispatch(setMessages([...selectMessageList]));
      }
      async function* processBuffer() {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          let newlineIndex;
          while ((newlineIndex = buffer.indexOf('\r\n\r\n')) >= 0) {
            const line = buffer.slice(0, newlineIndex + 1).trim();
            buffer = buffer.slice(newlineIndex + 1);

            if (line.startsWith('data: ')) {
              yield line.slice(6);
            }

            if (line === '') {
              continue;
            }
          }
        }
      }

      for await (const message of processBuffer()) {
        const value: SseResponseLine = JSON.parse(message);

        if (value.k === SseResponseKind.StopId) {
          const stopId = value.r;
          console.log('stopId', stopId);
        }
        else if (value.k === SseResponseKind.Segment) {
          text += value.r;
          setSelectMessages({ text });
        }
        else if (value.k === SseResponseKind.Error) { // error
          errorChat = true;
          handleUpdateChatStatus(errorChat);
          controller.abort();
          setSelectMessages({ text, error: value.r });
          break;
        }
        else if (value.k === SseResponseKind.End) {
          console.log('End', value.r);
        }
        if (stopConversationRef.current === true) {
          controller.abort();
          break;
        }
      }

      if (isChatEmpty) {
        setTimeout(async () => {
          const data = await getChat(selectChatId);
          const _chats = chats.map((x) => {
            if (x.id === data.id) {
              return data;
            }
            return x;
          });
          userModelConfigDispatch(setUserModelConfig(data.userModelConfig));
          handleUpdateChats(_chats);
        }, 100);
      }

      chatDispatch(setMessageIsStreaming(false));
      !errorChat &&
        setTimeout(() => {
          handleUpdateCurrentMessage(selectChatId);
        }, 200);
      stopConversationRef.current = false;
    },
    [
      prompt,
      temperature,
      enableSearch,
      chats,
      selectChat,
      chatError,
      currentMessages,
      selectMessages,
      selectModel,
      stopConversationRef,
    ],
  );

  useCallback(() => {
    if (autoScrollEnabled) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [autoScrollEnabled]);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      const bottomTolerance = 30;

      if (scrollTop + clientHeight < scrollHeight - bottomTolerance) {
        setAutoScrollEnabled(false);
        setShowScrollDownButton(true);
      } else {
        setAutoScrollEnabled(true);
        setShowScrollDownButton(false);
      }
    }
  };

  const handleScrollDown = () => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  const scrollDown = () => {
    if (autoScrollEnabled) {
      messagesEndRef.current?.scrollIntoView(true);
    }
  };
  const throttledScrollDown = throttle(scrollDown, 250);

  useEffect(() => {
    throttledScrollDown();
  }, [selectMessages, throttledScrollDown]);

  useEffect(() => {}, [prompt, temperature, enableSearch]);

  const onChangePrompt = (prompt: Prompt) => {
    if (prompt.temperature !== null) {
      userModelConfigDispatch(setTemperature(prompt.temperature));
    }
  };

  return (
    <div className="relative flex-1 overflow-hidden">
      <>
        <div
          className="max-h-full overflow-x-hidden scroll-container"
          ref={chatContainerRef}
          onScroll={handleScroll}
        >
          <div className="sticky top-0 pt-1 z-10 text-sm bg-background right-0">
            <div className="flex items-center justify-between h-10">
              <div
                className={cn(
                  'flex justify-start items-center ml-24',
                  showChatBar && 'ml-6',
                )}
              >
                {hasModel() && (
                  <ChangeModel
                    models={models}
                    className="font-semibold text-base"
                    content={selectModel?.name}
                    onChangeModel={(model) => {
                      modelDispatch(setSelectedModel(model));
                      userModelConfigDispatch(
                        setEnableSearch(model.allowSearch),
                      );
                      if (selectChat.id) {
                        putUserChatModel(selectChat.id, model.modelId);
                      }
                    }}
                  />
                )}
              </div>
              <div className="mr-2 md:mr-4">{<ModeToggle />}</div>
            </div>
          </div>
          {selectMessages?.length === 0 ? (
            <div className="mx-auto flex flex-col space-y-5 md:space-y-10 px-3 pt-[52px] sm:max-w-[600px]">
              {hasModel() && (
                <div className="flex h-full flex-col space-y-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-600">
                  <ModelSelect />
                  {selectModel?.allowSystemPrompt && prompt && (
                    <SystemPrompt
                      currentPrompt={prompt}
                      prompts={prompts}
                      model={selectModel}
                      onChangePromptText={(value) => {
                        userModelConfigDispatch(setPrompt(value));
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
                        onChangeTemperature={(value) =>
                          userModelConfigDispatch(setTemperature(value))
                        }
                      />
                    )}
                  {selectModel?.allowSearch && enableSearch != undefined && (
                    <EnableNetworkSearch
                      label={t('Internet Search')}
                      enable={enableSearch}
                      onChange={(value) => {
                        userModelConfigDispatch(setEnableSearch(value));
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              {selectMessages.map((current, index) => {
                let lastMessage = selectMessages[selectMessages.length - 1];
                let parentChildrenIds: string[] = [];
                if (!current.parentId) {
                  parentChildrenIds = currentMessages
                    .filter((x) => !x.parentId)
                    .map((x) => x.id);
                } else {
                  parentChildrenIds =
                    currentMessages.find((x) => x.id === current.parentId)
                      ?.childrenIds || [];
                  parentChildrenIds = [...parentChildrenIds].reverse();
                }
                return (
                  <MemoizedChatMessage
                    models={models}
                    selectChat={selectChat}
                    key={current.id + index}
                    modelName={current.modelName}
                    modelId={current.modelId}
                    currentSelectIndex={parentChildrenIds.findIndex(
                      (x) => x === current.id,
                    )}
                    parentId={current.parentId}
                    childrenIds={current.childrenIds}
                    parentChildrenIds={parentChildrenIds}
                    assistantChildrenIds={current.assistantChildrenIds}
                    assistantCurrentSelectIndex={current.assistantChildrenIds.findIndex(
                      (x) => x === current.id,
                    )}
                    lastMessageId={lastMessage.id}
                    message={{
                      id: current.id!,
                      role: current.role,
                      content: current.content,
                      duration: current.duration || 0,
                      firstTokenLatency: current.firstTokenLatency || 0,
                      inputTokens: current.inputTokens || 0,
                      outputTokens: current.outputTokens || 0,
                      reasoningTokens: current.reasoningTokens || 0,
                      inputPrice: current.inputPrice || 0,
                      outputPrice: current.outputPrice || 0,
                    }}
                    messageIsStreaming={messageIsStreaming}
                    currentChatMessageId={currentChatMessageId}
                    chatError={chatError}
                    onChangeMessage={(messageId) => {
                      handleUpdateSelectMessage(messageId);
                    }}
                    onRegenerate={(modelId?: number) => {
                      const message = currentMessages.find(
                        (x) => x.id === current.parentId,
                      );
                      if (!message) return;
                      handleSend(
                        { role: 'user', content: message.content },
                        current.parentId || '',
                        true,
                        modelId,
                      );
                    }}
                    onEdit={(editedMessage, parentId) => {
                      handleSend(editedMessage, parentId || '', false);
                    }}
                  />
                );
              })}

              <div className="h-[162px] bg-background" ref={messagesEndRef} />
            </>
          )}
        </div>
        {hasModel() && (
          <ChatInput
            stopConversationRef={stopConversationRef}
            onSend={(message) => {
              const { lastMessage } = getSelectMessagesLast();
              handleSend(message, lastMessage?.id, false);
            }}
            model={selectModel!}
            onScrollDownClick={handleScrollDown}
            showScrollDownButton={showScrollDownButton}
            onChangePrompt={onChangePrompt}
          />
        )}
        {!hasModel() && !selectChat?.id && <NoModel />}
      </>
    </div>
  );
});
Chat.displayName = 'Chat';
export default Chat;
