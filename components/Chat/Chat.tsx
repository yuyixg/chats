import {
  MutableRefObject,
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { throttle } from '@/utils/throttle';
import { ChatBody, Message, Role } from '@/types/chat';
import { ChatInput } from './ChatInput';
import { MemoizedChatMessage } from './MemoizedChatMessage';
import { ModelSelect } from './ModelSelect';
import { HomeContext } from '@/pages/home/home';
import { v4 as uuidv4 } from 'uuid';
import { getChat, postChats } from '@/apis/userService';
import { TemperatureSlider } from './Temperature';
import { CurrentModel, ModelApiConfig } from '@/types/model';
import { ModelTemplates } from '@/types/template';
import { SystemPrompt } from './SystemPrompt';
import EnableNetworkSearch from './EnableNetworkSearch';
import { SharedMessageModal } from './SharedMessageModal';
import { IconShare } from '../Icons';
interface Props {
  stopConversationRef: MutableRefObject<boolean>;
}

export const Chat = memo(({ stopConversationRef }: Props) => {
  const { t } = useTranslation('chat');

  const {
    state: {
      selectChatId,
      selectModelId,
      selectMessages,
      currentMessages,
      chats,
      models,
      prompts,
      userModelConfig,
      canChat,
    },
    handleUpdateSelectMessage,
    handleUpdateCurrentMessage,
    handleUpdateChat,
    handleUpdateUserModelConfig,
    hasModel,
    getModel,
    dispatch: homeDispatch,
  } = useContext(HomeContext);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showScrollDownButton, setShowScrollDownButton] =
    useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentModel, setCurrentModel] = useState<CurrentModel>(
    {} as CurrentModel
  );
  const [modeApiConfig, setModelApiConfig] = useState<ModelApiConfig>(
    {} as ModelApiConfig
  );
  const [messageCanChat, setMessageCanChat] = useState(canChat);
  const currentSelectChat = chats.find((x) => x.id === selectChatId);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      modelId: string = ''
    ) => {
      homeDispatch({ field: 'chatError', value: false });
      let _selectChatId = selectChatId;
      let _selectMessages = [...selectMessages];
      let _chats = chats;
      let assistantParentId = messageId;
      if (!selectChatId) {
        const newChat = await postChats({ title: t('New Conversation') });
        _selectChatId = newChat.id;
        _chats.push(newChat);
        homeDispatch({ field: 'selectChatId', value: newChat.id });
        homeDispatch({ field: 'currentMessages', value: [] });
        homeDispatch({ field: 'selectMessages', value: [] });
        homeDispatch({ field: 'chats', value: [..._chats] });
      }
      if (messageId && isRegenerate) {
        const messageIndex = _selectMessages.findIndex(
          (x) => x.id === messageId
        );
        homeDispatch({ field: 'selectMessageLastId', value: messageId });
        _selectMessages.splice(messageIndex + 1, _selectMessages.length);
      } else {
        const userTempId = uuidv4();
        assistantParentId = userTempId;
        homeDispatch({ field: 'selectMessageLastId', value: userTempId });
        const parentMessage = _selectMessages.find((x) => x.id == messageId);
        parentMessage && parentMessage?.childrenIds.unshift(userTempId);
        const parentMessageIndex = _selectMessages.findIndex(
          (x) => x.id == messageId
        );
        const newUserMessage = {
          id: userTempId,
          role: 'user' as Role,
          parentId: messageId,
          childrenIds: [],
          assistantChildrenIds: [],
          content: message.content,
        };
        let removeCount = -1;
        if (parentMessageIndex !== -1) removeCount = _selectMessages.length - 1;
        if (!messageId) {
          removeCount = _selectMessages.length;
          homeDispatch({
            field: 'currentMessages',
            value: [...currentMessages, newUserMessage],
          });
        }

        _selectMessages.splice(
          parentMessageIndex + 1,
          removeCount,
          newUserMessage
        );
      }

      const assistantTempId = uuidv4();
      const newAssistantMessage = {
        id: assistantTempId,
        role: 'assistant' as Role,
        parentId: assistantParentId,
        childrenIds: [],
        assistantChildrenIds: [],
        content: {
          image: [],
          text: '',
        },
      };

      homeDispatch({
        field: 'currentChatMessageId',
        value: assistantTempId,
      });
      _selectMessages.push(newAssistantMessage);

      homeDispatch({
        field: 'selectMessages',
        value: [..._selectMessages],
      });
      homeDispatch({ field: 'loading', value: true });
      homeDispatch({ field: 'messageIsStreaming', value: true });
      const messageContent = message.content;
      const chatBody: ChatBody = {
        modelId: modelId || selectModelId!,
        chatId: _selectChatId!,
        messageId,
        userMessage: messageContent,
        userModelConfig,
      };
      let body = JSON.stringify(chatBody);

      const controller = new AbortController();
      const response = await fetch('api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body,
      });

      if (!response.ok) {
        homeDispatch({ field: 'loading', value: false });
        homeDispatch({ field: 'messageIsStreaming', value: false });
        homeDispatch({ field: 'chatError', value: true });
        const result = await response.json();
        toast.error(t(result?.message) || response.statusText);
        return;
      }
      const data = response.body;
      if (!data) {
        homeDispatch({ field: 'loading', value: false });
        homeDispatch({ field: 'messageIsStreaming', value: false });
        homeDispatch({ field: 'chatError', value: true });
        return;
      }

      let done = false;
      let text = '';
      const reader = data.getReader();
      const decoder = new TextDecoder();

      while (!done) {
        if (stopConversationRef.current === true) {
          controller.abort();
          done = true;
          break;
        }
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        text += chunkValue;

        let lastMessages = _selectMessages[_selectMessages.length - 1];
        lastMessages = {
          ...lastMessages,
          content: { text },
        };

        _selectMessages.splice(-1, 1, lastMessages);

        homeDispatch({
          field: 'selectMessages',
          value: [..._selectMessages],
        });
      }
      if (_selectMessages.length === 1) {
        const userMessageText = message.content.text!;
        const title =
          userMessageText.length > 30
            ? userMessageText.substring(0, 30) + '...'
            : userMessageText;
        handleUpdateChat(_chats, _selectChatId!, {
          title,
          chatModelId: selectModelId,
        });
      }
      !chats.find((x) => x.id === _selectChatId)?.chatModelId &&
        getChat(_selectChatId!).then((data) => {
          const _chats = chats.map((x) => {
            if (x.id === data.id) {
              return data;
            }
            return x;
          });
          homeDispatch({
            field: 'userModelConfig',
            value: data.userModelConfig,
          });
          homeDispatch({ field: 'chats', value: _chats });
        });
      homeDispatch({ field: 'loading', value: false });
      homeDispatch({ field: 'messageIsStreaming', value: false });
      !stopConversationRef.current &&
        handleUpdateCurrentMessage(_selectChatId!);
    },
    [
      userModelConfig,
      chats,
      selectChatId,
      currentMessages,
      selectMessages,
      selectModelId,
      stopConversationRef,
    ]
  );

  useCallback(() => {
    if (autoScrollEnabled) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      textareaRef.current?.focus();
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

  const handleSettings = () => {
    setShowSettings(!showSettings);
  };

  const handleSharedMessage = (isShared: boolean) => {
    handleUpdateChat(chats, selectChatId!, { isShared });
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setAutoScrollEnabled(entry.isIntersecting);
        if (entry.isIntersecting) {
          textareaRef.current?.focus();
        }
      },
      {
        root: null,
        threshold: 0.5,
      }
    );
    const messagesEndElement = messagesEndRef.current;
    if (messagesEndElement) {
      observer.observe(messagesEndElement);
    }
    return () => {
      if (messagesEndElement) {
        observer.unobserve(messagesEndElement);
      }
    };
  }, [messagesEndRef]);

  useEffect(() => {
    const { name, modelConfig, modelVersion } =
      getModel(models, selectModelId!) || {};
    setCurrentModel({
      name,
      ...modelConfig,
      temperature:
        currentSelectChat?.userModelConfig?.temperature ||
        modelConfig?.temperature,
      prompt: currentSelectChat?.userModelConfig?.prompt || modelConfig?.prompt,
      enableSearch:
        currentSelectChat?.userModelConfig?.enableSearch ||
        modelConfig?.enableSearch,
    });
    setModelApiConfig(ModelTemplates[modelVersion]?.config as any);
  }, [selectModelId]);

  useEffect(() => {
    setMessageCanChat(canChat);
  }, [canChat]);

  return (
    <div className='relative flex-1 overflow-hidden bg-white dark:bg-[#262630]'>
      <>
        <div
          className='max-h-full overflow-x-hidden'
          ref={chatContainerRef}
          onScroll={handleScroll}
        >
          {selectMessages?.length === 0 ? (
            <>
              <div className='mx-auto flex flex-col space-y-5 md:space-y-10 px-3 pt-16 sm:max-w-[600px]'>
                {models.length !== 0 && (
                  <div className='flex h-full flex-col space-y-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-600'>
                    <ModelSelect />
                    {currentModel?.prompt && (
                      <SystemPrompt
                        currentPrompt={currentModel?.prompt}
                        prompts={prompts}
                        onChangePrompt={(prompt) => {
                          handleUpdateUserModelConfig({ prompt });
                        }}
                      />
                    )}
                    {currentModel.temperature && (
                      <TemperatureSlider
                        label={t('Temperature')}
                        min={modeApiConfig.temperature.min}
                        max={modeApiConfig.temperature.max}
                        defaultTemperature={currentModel.temperature}
                        onChangeTemperature={(temperature) =>
                          handleUpdateUserModelConfig({
                            temperature,
                          })
                        }
                      />
                    )}
                    {currentModel?.enableSearch != undefined && (
                      <EnableNetworkSearch
                        label={t('Internet Search')}
                        enable={currentModel.enableSearch}
                        onChange={(enableSearch) => {
                          handleUpdateUserModelConfig({
                            enableSearch,
                          });
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {currentSelectChat && (
                <div className='sticky top-0 z-10 bg-white py-2 text-sm text-neutral-500 dark:border-none dark:bg-[#262630] dark:text-neutral-200'>
                  <div className='mt-[6px] md:mt-3 flex justify-center items-center gap-1'>
                    <div>{currentModel.name}</div>
                    {currentModel?.temperature && (
                      <div className='flex'>{currentModel.temperature}­°C</div>
                    )}
                    {currentModel.name && (
                      <button
                        className='ml-1 cursor-pointer hover:opacity-50'
                        onClick={() => {
                          setShowShareModal(true);
                        }}
                      >
                        <IconShare
                          size={16}
                          stroke={
                            currentSelectChat?.isShared
                              ? 'hsl(var(--primary))'
                              : '#737373'
                          }
                        />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {showSettings && (
                <div className='flex flex-col space-y-10 md:mx-auto md:max-w-xl md:gap-6 md:py-3 md:pt-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl'>
                  <div className='flex h-full flex-col space-y-4 border-b border-neutral-200 p-4 dark:border-neutral-600 md:rounded-lg md:border'>
                    <ModelSelect />
                  </div>
                </div>
              )}

              {selectMessages.map((current, index) => {
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
                    currentSelectIndex={parentChildrenIds.findIndex(
                      (x) => x === current.id
                    )}
                    isLastMessage={selectMessages.length - 1 === index}
                    id={current.id!}
                    key={current.id + index}
                    parentId={current.parentId}
                    childrenIds={current.childrenIds}
                    parentChildrenIds={parentChildrenIds}
                    assistantChildrenIds={current.assistantChildrenIds}
                    assistantCurrentSelectIndex={current.assistantChildrenIds.findIndex(
                      (x) => x === current.id
                    )}
                    modelName={current.modelName}
                    message={{ role: current.role, content: current.content }}
                    onChangeMessage={(messageId) => {
                      handleUpdateSelectMessage(messageId);
                    }}
                    onRegenerate={(modelId?: string) => {
                      const message = currentMessages.find(
                        (x) => x.id === current.parentId
                      );
                      if (!message) return;
                      handleSend(
                        { role: 'user', content: message.content },
                        current.parentId || '',
                        true,
                        modelId
                      );
                    }}
                    onEdit={(editedMessage, parentId) => {
                      handleSend(editedMessage, parentId || '', false);
                    }}
                  />
                );
              })}

              <div
                className='h-[162px] bg-white dark:bg-[#262630]'
                ref={messagesEndRef}
              />
            </>
          )}
        </div>
        {messageCanChat && (
          <ChatInput
            stopConversationRef={stopConversationRef}
            textareaRef={textareaRef}
            onSend={(message) => {
              const { lastMessage } = getSelectMessagesLast();
              handleSend(message, lastMessage?.id, false);
            }}
            onScrollDownClick={handleScrollDown}
            showScrollDownButton={showScrollDownButton}
          />
        )}
        {showShareModal && (
          <SharedMessageModal
            isOpen={showShareModal}
            onClose={() => {
              setShowShareModal(false);
            }}
            chat={currentSelectChat!}
            onShareChange={handleSharedMessage}
          />
        )}
      </>
    </div>
  );
});
Chat.displayName = 'Chat';
