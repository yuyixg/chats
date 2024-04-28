import { IconShare } from '@/components/Icons/index';
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
import { saveConversation, saveConversations } from '@/utils/conversation';
import { throttle } from '@/utils/throttle';
import { ChatBody, Conversation, Message } from '@/types/chat';
import Spinner from '../Spinner';
import { ChatInput } from './ChatInput';
import { ChatLoader } from './ChatLoader';
import { MemoizedChatMessage } from './MemoizedChatMessage';
import { ModelSelect } from './ModelSelect';
import { SystemPrompt } from './SystemPrompt';
import { HomeContext } from '@/pages/home/home';
import { SharedMessageModal } from './SharedMessageModal';
import { AccountBalance } from './AccountBalance';
import { ModelProviders } from '@/types/model';
import { useCreateReducer } from '@/hooks/useCreateReducer';
import { ChatMessageInitialState, initialState } from './ChatMessage.state';
import ChatMessageContext from './ChatMessage.content';

interface Props {
  stopConversationRef: MutableRefObject<boolean>;
}

interface ExtractChatResult {
  title: string;
  displayingLeafChatMessageNodeId: string;
}

export const Chat = memo(({ stopConversationRef }: Props) => {
  const { t } = useTranslation('chat');

  const {
    state: {
      selectedConversation,
      selectChatId,
      selectModelId,
      selectMessages,
      chats,
      conversations,
      modelsLoading,
      loading,
      prompts,
    },
    handleUpdateSelectMessage,
    handleUpdateChat,
    handleUpdateConversation,
    hasModel,
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  console.log(selectMessages);

  const [currentMessage, setCurrentMessage] = useState<Message>();
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showScrollDownButton, setShowScrollDownButton] =
    useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  function extractChatResult(text: string): ExtractChatResult {
    const match = text.match(/<end>(.*?)<\/end>/);
    return match ? JSON.parse(match[1]) : {};
  }

  const handleSend = useCallback(
    async (message: Message, parentId: string | null, deleteCount = 0) => {
      if (selectChatId) {
        // let updatedConversation: Conversation;
        // if (deleteCount) {
        //   const updatedMessages = [...selectedConversation.messages];
        //   for (let i = 0; i < deleteCount; i++) {
        //     updatedMessages.pop();
        //   }
        //   updatedConversation = {
        //     ...selectedConversation,
        //     messages: [...updatedMessages, message],
        //   };
        // } else {
        //   updatedConversation = {
        //     ...selectedConversation,
        //     messages: [...selectedConversation.messages, message],
        //   };
        // }
        // homeDispatch({
        //   field: 'selectedConversation',
        //   value: updatedConversation,
        // });
        // homeDispatch({ field: 'loading', value: true });
        // homeDispatch({ field: 'messageIsStreaming', value: true });
        const messageContent = message.content;
        const chatBody: ChatBody = {
          modelId: selectModelId!,
          chatId: selectChatId!,
          parentId: parentId,
          userMessage: messageContent,
        };

        const endpoint = getModelEndpoint();
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
        console.log('response.body', response.body);
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

        homeDispatch({ field: 'loading', value: false });
        let done = false;
        let isFirst = true;
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
          // if (isFirst) {
          //   isFirst = false;
          //   const updatedMessages: Message[] = [
          //     ...currentMessages,
          //     { role: 'assistant', content: { text: chunkValue } },
          //   ];
          //   updatedConversation = {
          //     ...updatedConversation,
          //     messages: updatedMessages,
          //   };
          //   homeDispatch({
          //     field: 'currentMessages',
          //     value: updatedConversation,
          //   });
          // }
          // else {
          //   const updatedMessages: Message[] = updatedConversation.messages.map(
          //     (message, index) => {
          //       if (index === updatedConversation.messages.length - 1) {
          //         return {
          //           ...message,
          //           content: { text },
          //         };
          //       }
          //       return message;
          //     }
          //   );
          //   updatedConversation = {
          //     ...updatedConversation,
          //     messages: updatedMessages,
          //   };
          //   homeDispatch({
          //     field: 'selectedConversation',
          //     value: updatedConversation,
          //   });
          // }
        }

        const chatResult = extractChatResult(text);
        handleUpdateChat(selectChatId, { ...chatResult });

        console.log('response.body 2', response.body);
        // saveConversation(updatedConversation);
        // const updatedConversations: Conversation[] = conversations.map(
        //   (conversation) => {
        //     if (conversation.id === selectChatId) {
        //       return updatedConversation;
        //     }
        //     return conversation;
        //   }
        // );
        // if (updatedConversations.length === 0) {
        //   updatedConversations.push(updatedConversation);
        // }
        // homeDispatch({ field: 'conversations', value: updatedConversations });
        // saveConversations(updatedConversations);
        homeDispatch({ field: 'messageIsStreaming', value: false });
      }
    },
    [chats, selectChatId, stopConversationRef]
  );

  const scrollToBottom = useCallback(() => {
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

  const handleSharedMessage = (isShare: boolean) => {
    handleUpdateConversation(selectedConversation!, {
      key: 'isShared',
      value: isShare,
    });
  };

  const onClearAll = () => {
    if (
      confirm(t('Are you sure you want to clear all messages?')!) &&
      selectedConversation
    ) {
      handleUpdateConversation(selectedConversation, {
        key: 'messages',
        value: [],
      });
    }
  };

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
    selectedConversation &&
      setCurrentMessage(
        selectedConversation.messages[selectedConversation.messages.length - 2]
      );
  }, [selectedConversation, throttledScrollDown]);

  useEffect(() => {
    console.log(selectChatId);
    handleUpdateSelectMessage(selectChatId!);
  }, [selectChatId]);

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
                <div className='text-center text-3xl font-semibold text-gray-800 dark:text-gray-100'>
                  {modelsLoading ? (
                    <div>
                      <Spinner size='16px' className='mx-auto' />
                    </div>
                  ) : (
                    // models.length == 0 && t('No model data.')
                    <></>
                  )}
                </div>

                {
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
                }
              </div>
            </>
          ) : (
            <>
              {selectedConversation && (
                <div className='sticky top-0 z-10 flex justify-center bg-white py-2 text-sm text-neutral-500 dark:border-none dark:bg-[#343541] dark:text-neutral-200'>
                  {selectedConversation?.model?.name?.toUpperCase()}
                  {/* {t('Temp')}:{selectedConversation?.temperature} | */}
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
                  </button>
                </div>
              )}
              {showSettings && (
                <div className='flex flex-col space-y-10 md:mx-auto md:max-w-xl md:gap-6 md:py-3 md:pt-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl'>
                  <div className='flex h-full flex-col space-y-4 border-b border-neutral-200 p-4 dark:border-neutral-600 md:rounded-lg md:border'>
                    <ModelSelect />
                  </div>
                </div>
              )}

              {selectMessages.map((current) =>
                current.messages.map((message, index) => (
                  <MemoizedChatMessage
                    id={current.id!}
                    key={current.id + index}
                    parentId={current.parentId}
                    lastLeafId={current.lastLeafId}
                    childrenIds={current.childrenIds}
                    message={message}
                    onEdit={(editedMessage, parentId) => {
                      setCurrentMessage(editedMessage);
                      // discard edited message and the ones that come after then resend
                      handleSend(editedMessage, parentId);
                    }}
                  />
                ))
              )}

              {loading && <ChatLoader />}

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
              handleSend(message, null);
            }}
            onScrollDownClick={handleScrollDown}
            onRegenerate={() => {
              const lastMessage =
                selectedConversation?.messages[
                  selectedConversation?.messages.length - 1
                ];
              if (lastMessage?.role === 'user') {
                handleSend(lastMessage, null);
              } else {
                if (currentMessage) {
                  handleSend(currentMessage, null);
                }
              }
            }}
            showScrollDownButton={showScrollDownButton}
          />
        )}
        <SharedMessageModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
          }}
          conversation={selectedConversation}
          onShareChange={handleSharedMessage}
        />
      </>
    </div>
  );
});
Chat.displayName = 'Chat';
