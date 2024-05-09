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
import { getModelEndpoint } from '@/utils/apis';
import { throttle } from '@/utils/throttle';
import { ChatBody, Message } from '@/types/chat';
import Spinner from '../Spinner';
import { ChatInput } from './ChatInput';
import { MemoizedChatMessage } from './MemoizedChatMessage';
import { ModelSelect } from './ModelSelect';
import { HomeContext } from '@/pages/home/home';
import { AccountBalance } from './AccountBalance';
import { v4 as uuidv4 } from 'uuid';
import { getUserMessages, postChats } from '@/apis/userService';
import { getSelectMessages } from '@/utils/message';
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
    },
    handleUpdateSelectMessage,
    handleUpdateCurrentMessage,
    handleUpdateChat,
    hasModel,
    getModel,
    dispatch: homeDispatch,
  } = useContext(HomeContext);
  const [currentMessage, setCurrentMessage] = useState<Message>();
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showScrollDownButton, setShowScrollDownButton] =
    useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const getSelectMessageParent = () => {
    const selectMessageLength = selectMessages.length;
    if (selectMessageLength === 0) return null;
    return selectMessages[selectMessageLength - 1];
  };

  const getSelectMessagesLast = () => {
    const selectMessageLength = selectMessages.length - 1;
    const lastMessage = { ...selectMessages[selectMessageLength] };
    return { lastMessage, selectMessageLength };
  };

  const handleSend = useCallback(
    async (message: Message, parentId: string | null, messageId = '') => {
      let _selectChatId = selectChatId;
      let _selectMessages = [...selectMessages];
      if (!selectChatId) {
        const newChat = await postChats({ title: t('New Conversation') });
        _selectChatId = newChat.id;
        homeDispatch({ field: 'selectChatId', value: newChat.id });
        homeDispatch({ field: 'currentMessages', value: [] });
        homeDispatch({ field: 'selectMessages', value: [] });
        homeDispatch({ field: 'chats', value: [...chats, newChat] });
      }
      if (messageId) {
        const { lastMessage, selectMessageLength } = getSelectMessagesLast();
        lastMessage.messages[1].content = {
          image: [],
          text: '',
        };
        homeDispatch({ field: 'selectMessageLastId', value: messageId });
        selectMessages.splice(selectMessageLength, 1, lastMessage);
      } else {
        const tempUUID = uuidv4();
        homeDispatch({ field: 'selectMessageLastId', value: tempUUID });
        const parentMessage = _selectMessages.find((x) => x.id == parentId);
        parentMessage && parentMessage?.childrenIds.unshift(tempUUID);
        const parentMessageIndex = _selectMessages.findIndex(
          (x) => x.id == parentId
        );

        const newMessage = {
          id: tempUUID,
          lastLeafId: '',
          parentId,
          childrenIds: [],
          messages: [
            message,
            { role: 'assistant', content: { text: '' } },
          ] as Message[],
        };
        let removeCount = -1;
        if (parentMessageIndex !== -1) removeCount = _selectMessages.length - 1;
        if (!parentId) {
          removeCount = _selectMessages.length;
          homeDispatch({
            field: 'currentMessages',
            value: [...currentMessages, newMessage],
          });
        }

        _selectMessages.splice(parentMessageIndex + 1, removeCount, newMessage);
      }

      homeDispatch({
        field: 'selectMessages',
        value: [..._selectMessages],
      });
      homeDispatch({ field: 'loading', value: true });
      homeDispatch({ field: 'messageIsStreaming', value: true });
      const messageContent = message.content;
      const chatBody: ChatBody = {
        modelId: selectModelId!,
        chatId: _selectChatId!,
        parentId: parentId,
        messageId,
        userMessage: messageContent,
      };
      const endpoint = getModelEndpoint(getModel().modelProvider);
      let body = JSON.stringify(chatBody);

      const controller = new AbortController();
      const response = await fetch(endpoint, {
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
        const result = await response.json();
        toast.error(t(result?.message) || response.statusText);
        return;
      }
      const data = response.body;
      if (!data) {
        homeDispatch({ field: 'loading', value: false });
        homeDispatch({ field: 'messageIsStreaming', value: false });
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

        let laseMessages = _selectMessages[_selectMessages.length - 1];
        laseMessages.messages = laseMessages.messages.map((message, index) => {
          if (index === laseMessages.messages.length - 1) {
            return {
              ...message,
              content: { text },
            };
          }
          return message;
        });

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
        handleUpdateChat(_selectChatId!, { title, chatModelId: selectModelId });
      }

      homeDispatch({ field: 'loading', value: false });
      homeDispatch({ field: 'messageIsStreaming', value: false });
      handleUpdateCurrentMessage(_selectChatId!);
    },
    [
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

  // const handleSharedMessage = (isShare: boolean) => {
  //   handleUpdateConversation(selectedConversation!, {
  //     key: 'isShared',
  //     value: isShare,
  //   });
  // };

  const scrollDown = () => {
    if (autoScrollEnabled) {
      messagesEndRef.current?.scrollIntoView(true);
    }
  };
  const throttledScrollDown = throttle(scrollDown, 250);

  // useEffect(() => {
  //   if (currentMessage) {
  //     handleSend(currentMessage);
  //     homeDispatch({ field: 'currentMessage', value: undefined });
  //   }
  // }, [currentMessage]);

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

  return (
    <div className='relative flex-1 overflow-hidden bg-white dark:bg-[#343541]'>
      <>
        <div
          className='max-h-full overflow-x-hidden'
          ref={chatContainerRef}
          onScroll={handleScroll}
        >
          {selectMessages?.length === 0 ? (
            <>
              <div className='mx-auto flex flex-col space-y-5 md:space-y-10 px-3 pt-5 md:pt-12 sm:max-w-[600px]'>
                {models.length !== 0 && (
                  <div className='flex h-full flex-col space-y-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-600'>
                    <AccountBalance />
                    <ModelSelect />

                    {/* <SystemPrompt
                      conversation={selectedConversation}
                      prompts={prompts}
                      onChangePrompt={(prompt) =>
                        handleUpdateConversation(selectedConversation, {
                          key: 'prompt',
                          value: prompt,
                        })
                      }
                    /> */}

                    {/* <TemperatureSlider
                      label={t('Temperature')}
                      onChangeTemperature={(temperature) =>
                        handleUpdateConversation(selectedConversation, {
                          key: 'temperature',
                          value: temperature,
                        })
                      }
                    /> */}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {selectModelId && (
                <div className='sticky top-0 z-10 flex justify-center bg-white py-2 text-sm text-neutral-500 dark:border-none dark:bg-[#343541] dark:text-neutral-200'>
                  {getModel().name?.toUpperCase()}
                  {/* {t('Temp')}:{selectedConversation?.temperature} |
                  <button
                    className='ml-2 cursor-pointer hover:opacity-50'
                    onClick={() => {
                      setShowShareModal(true);
                    }}
                  >
                    <IconShare
                      size={18}
                      style={{
                        color: selectedConversation?.isShared
                          ? 'hsl(var(--primary))'
                          : '',
                      }}
                    />
                  </button> */}
                </div>
              )}

              {showSettings && (
                <div className='flex flex-col space-y-10 md:mx-auto md:max-w-xl md:gap-6 md:py-3 md:pt-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl'>
                  <div className='flex h-full flex-col space-y-4 border-b border-neutral-200 p-4 dark:border-neutral-600 md:rounded-lg md:border'>
                    <ModelSelect />
                  </div>
                </div>
              )}

              {selectMessages.map((current) => {
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
                return current.messages.map((message, index) => (
                  <MemoizedChatMessage
                    currentSelectIndex={parentChildrenIds.findIndex(
                      (x) => x === current.id
                    )}
                    id={current.id!}
                    key={current.id + index}
                    parentId={current.parentId}
                    childrenIds={current.childrenIds}
                    parentChildrenIds={parentChildrenIds}
                    message={message}
                    onChangeMessage={(messageId) => {
                      handleUpdateSelectMessage(messageId);
                    }}
                    onEdit={(editedMessage, parentId) => {
                      setCurrentMessage(editedMessage);
                      handleSend(editedMessage, parentId);
                    }}
                  />
                ));
              })}

              <div
                className='h-[162px] bg-white dark:bg-[#343541]'
                ref={messagesEndRef}
              />
            </>
          )}
        </div>
        {hasModel() && (
          <ChatInput
            stopConversationRef={stopConversationRef}
            textareaRef={textareaRef}
            onSend={(message) => {
              setCurrentMessage(message);
              const parentMessage = getSelectMessageParent();
              handleSend(message, parentMessage?.id || null);
            }}
            onScrollDownClick={handleScrollDown}
            onRegenerate={() => {
              const { lastMessage } = getSelectMessagesLast();
              const message = lastMessage.messages;
              handleSend(message[0], lastMessage.parentId, lastMessage.id);
            }}
            showScrollDownButton={showScrollDownButton}
          />
        )}
        {/* <SharedMessageModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
          }}
          conversation={selectedConversation}
          onShareChange={handleSharedMessage}
        /> */}
      </>
    </div>
  );
});
Chat.displayName = 'Chat';
