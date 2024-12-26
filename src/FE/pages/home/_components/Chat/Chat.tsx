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
import { findLastLeafId, findSelectedMessageByLeafId } from '@/utils/message';
import { throttle } from '@/utils/throttle';
import { getUserSession } from '@/utils/user';

import { ChatRole, ChatStatus, Content, Message } from '@/types/chat';
import {
  ChatMessage,
  SseResponseKind,
  SseResponseLine,
} from '@/types/chatMessage';
import { Prompt } from '@/types/prompt';

import ResponseMessage from '@/components/ChatMessage/ResponseMessage';
import ResponseMessageActions from '@/components/ChatMessage/ResponseMessageActions';
import UserMessage from '@/components/ChatMessage/UserMessage';

import { setChats, setStopIds } from '../../_actions/chat.actions';
import {
  setMessages,
  setSelectedMessages,
} from '../../_actions/message.actions';
import { setTemperature } from '../../_actions/userModelConfig.actions';
import HomeContext from '../../_contexts/home.context';
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import ChatModelSetting from './ChatModelSetting';
import NoModel from './NoModel';

import { cn } from '@/lib/utils';

const ResponseMessageTempId = 'RESPONSE_MESSAGE_TEMP_ID';
const UserMessageTempId = 'USER_MESSAGE_TEMP_ID';

const Chat = memo(() => {
  const { t } = useTranslation();
  const {
    state: {
      chats,
      selectedChat,

      messages,
      selectedMessages,

      models,
      selectModel,

      defaultPrompt,
    },
    handleChatIsError,

    hasModel,
    chatDispatch,
    messageDispatch,
    userModelConfigDispatch,
  } = useContext(HomeContext);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);
  const [showScrollDownButton, setShowScrollDownButton] =
    useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const getSelectedMessagesLastActiveMessage = () => {
    const selectedMessageLength = selectedMessages.length - 1;
    if (selectedMessageLength === -1) return null;
    const lastMessage = selectedMessages[selectedMessageLength].find(
      (x) => x.isActive,
    );
    return lastMessage;
  };

  const updateChatTitle = (title: string, append: boolean = false) => {
    const newChats = chats.map((chat) => {
      if (chat.id === selectedChat.id) {
        append ? (chat.title += title) : (chat.title = title);
      }
      return chat;
    });
    chatDispatch(setChats(newChats));
  };

  const generateResponseMessages = (parentId?: string) => {
    return selectedChat.spans.map((x) => {
      return generateResponseMessage(
        x.spanId,
        parentId,
        x.modelId,
        x.modelName,
      );
    });
  };

  const generateResponseMessage = (
    spanId: number,
    parentId?: string,
    modelId?: number,
    modelName?: string,
  ) => {
    return {
      spanId: spanId,
      id: `${ResponseMessageTempId}-${spanId}`,
      role: ChatRole.Assistant,
      parentId: parentId,
      status: ChatStatus.Chatting,
      siblingIds: [],
      isActive: false,
      content: { text: '', error: undefined, fileIds: [] },
      inputTokens: 0,
      outputTokens: 0,
      inputPrice: 0,
      outputPrice: 0,
      modelName: modelName,
      modelId: modelId,
      reasoningTokens: 0,
      duration: 0,
      firstTokenLatency: 0,
    } as ChatMessage;
  };

  const generateUserMessage = (content: Content, parentId?: string) => {
    return {
      spanId: null,
      id: UserMessageTempId,
      role: ChatRole.User,
      status: ChatStatus.None,
      parentId,
      siblingIds: [],
      isActive: false,
      content,
    } as ChatMessage;
  };

  const updateSelectedResponseMessage = (
    messages: ChatMessage[][],
    messageId: string,
    text: string,
    error?: string,
  ) => {
    const messageCount = messages.length - 1;
    let messageList = messages[messageCount];
    messageList.map((x) => {
      if (x.id === messageId) {
        x.content.text += text;
        x.content.error = error;
      }
      return x;
    });
    messages.splice(messageCount, 1, messageList);
    messageDispatch(setSelectedMessages(messages));
  };

  const handleSend = useCallback(
    async (message: Message, messageId?: string) => {
      let { id: chatId, spans: chatSpans } = selectedChat;
      let selectedMessageList = [...selectedMessages];
      let userMessage = generateUserMessage(message.content, messageId);
      selectedMessageList.push([userMessage]);
      let responseMessages = generateResponseMessages(messageId);
      selectedMessageList.push(responseMessages);
      messageDispatch(setSelectedMessages(selectedMessageList));

      let chatBody = {
        chatId,
        spans: chatSpans.map((x) => ({
          id: x.spanId,
          systemPrompt: defaultPrompt?.content,
          setsTemperature: true,
          enableSearch: x.enableSearch,
          temperature: x.temperature,
        })),
        utcOffset: new Date().getTimezoneOffset(),
        parentAssistantMessageId: messageId || null,
        userMessage: message.content,
      };

      const response = await fetch(
        `${getApiUrl()}/api/chats/fresh-chat-message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getUserSession()}`,
          },
          body: JSON.stringify(chatBody),
        },
      );

      await handleChatMessage(response, selectedMessageList);
    },
    [chats, selectedChat, selectedMessages, selectModel],
  );

  const handleRegenerate = async (
    spanId: number,
    messageId: string,
    modelId: number,
  ) => {
    let { id: chatId } = selectedChat;
    let selectedMessageList = [...selectedMessages];
    const responseMessages = generateResponseMessage(spanId, messageId);
    const index = selectedMessages.findIndex(
      (x) => x.findIndex((m) => m.parentId === messageId) !== -1,
    );
    selectedMessageList[index] = selectedMessageList[index].map((m) => {
      if (m.spanId === spanId) {
        responseMessages.siblingIds = [responseMessages.id, ...m.siblingIds];
        return responseMessages;
      }
      return m;
    });

    selectedMessageList = selectedMessageList.slice(0, index + 1);

    messageDispatch(setSelectedMessages(selectedMessageList));

    let chatBody = {
      chatId,
      spanId,
      modelId,
      parentUserMessageId: messageId || null,
    };

    const response = await fetch(
      `${getApiUrl()}/api/chats/regenerate-assistant-message`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getUserSession()}`,
        },
        body: JSON.stringify(chatBody),
      },
    );

    await handleChatMessage(response, selectedMessageList);
  };

  const handleEditMessageSend = async (
    message: Message,
    messageId?: string,
  ) => {
    let { id: chatId, spans: chatSpans } = selectedChat;
    let index = selectedMessages.findIndex(
      (x) => x.findIndex((m) => m.id === messageId) !== -1,
    );
    index += 1;
    let selectedMessageList = selectedMessages.slice(0, index);
    let userMessage = generateUserMessage(message.content, messageId);
    selectedMessageList.push([userMessage]);
    let responseMessages = generateResponseMessages(messageId);
    selectedMessageList.push(responseMessages);
    messageDispatch(setSelectedMessages(selectedMessageList));

    let chatBody = {
      chatId,
      spanIds: chatSpans.map((x) => x.spanId),
      parentAssistantMessageId: messageId || null,
      userMessage: message.content,
    };

    const response = await fetch(`${getApiUrl()}/api/chats/general-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getUserSession()}`,
      },
      body: JSON.stringify(chatBody),
    });

    await handleChatMessage(response, selectedMessageList);
  };

  const handleChatMessage = async (
    response: Response,
    selectedMessageList: ChatMessage[][],
  ) => {
    let messageList = [...messages];
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

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    async function* processBuffer() {
      while (true) {
        const { done, value } = await reader.read();
        console.log(done, value);
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
        chatDispatch(setStopIds([value.r]));
      } else if (value.k === SseResponseKind.Segment) {
        const msgId = `${ResponseMessageTempId}-${value.i}`;
        updateSelectedResponseMessage(selectedMessageList, msgId, value.r);
      } else if (value.k === SseResponseKind.Error) {
        const msgId = `${ResponseMessageTempId}-${value.i}`;
        updateSelectedResponseMessage(
          selectedMessageList,
          msgId,
          value.r,
          value.r,
        );
      } else if (value.k === SseResponseKind.UserMessage) {
        const msg = value.r;
        messageList.push(msg);
      } else if (value.k === SseResponseKind.ResponseMessage) {
        const msg = value.r;
        messageList.push(msg);
      } else if (value.k === SseResponseKind.UpdateTitle) {
        updateChatTitle(value.r);
      } else if (value.k === SseResponseKind.TitleSegment) {
        updateChatTitle(value.r, true);
      }
    }

    const selectedMsgs = findSelectedMessageByLeafId(
      messageList,
      messageList[messageList.length - 1].id,
    );
    messageDispatch(setMessages(messageList));
    messageDispatch(setSelectedMessages(selectedMsgs));
  };

  const handleChangeMessage = (messageId: string) => {
    const leafId = findLastLeafId(messages, messageId);
    const selectedMsgs = findSelectedMessageByLeafId(messages, leafId);
    messageDispatch(setSelectedMessages(selectedMsgs));
    console.log(selectedMsgs, messages);
  };

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
  }, [selectedMessages, throttledScrollDown]);

  const onChangePrompt = (prompt: Prompt) => {
    if (prompt.temperature !== null) {
      userModelConfigDispatch(setTemperature(prompt.temperature));
    }
  };

  const handelMessageActive = (messageId: string) => {
    const leafId = findLastLeafId(messages, messageId);
    const selectedMessageList = findSelectedMessageByLeafId(messages, leafId);
    messageDispatch(setSelectedMessages(selectedMessageList));
  };

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        className="max-h-full overflow-x-hidden scroll-container"
        ref={chatContainerRef}
        onScroll={handleScroll}
      >
        <ChatHeader />

        {selectedMessages?.length === 0 ? (
          <ChatModelSetting />
        ) : (
          <div className="w-4/5 m-auto p-4">
            {selectedMessages.map((messages, index) => {
              return (
                <div
                  key={'message-group-' + index}
                  className={cn(
                    messages.find((x) => x.role === ChatRole.User)
                      ? 'flex w-full justify-end'
                      : 'grid grid-cols-[repeat(auto-fit,minmax(375px,1fr))] gap-4',
                  )}
                >
                  {messages.map((message) => {
                    return (
                      <>
                        {message.role === ChatRole.User && (
                          <div
                            key={'user-message-' + message.id}
                            className={cn(
                              'prose w-full dark:prose-invert rounded-r-md group',
                              index > 0 && 'mt-6',
                            )}
                          >
                            <UserMessage
                              selectedChat={selectedChat}
                              chatStatus={message.status}
                              message={message}
                              onChangeMessage={handleChangeMessage}
                              onEdit={handleEditMessageSend}
                            />
                          </div>
                        )}
                        {message.role === ChatRole.Assistant && (
                          <div
                            onClick={() => handelMessageActive(message.id)}
                            key={'response-message-' + message.id}
                            className={cn(
                              'border-[1px] rounded-md p-4',
                              message.isActive && 'border-primary/50',
                            )}
                          >
                            <div className="prose dark:prose-invert rounded-r-md">
                              <ResponseMessage
                                chatStatus={message.status}
                                currentChatMessageId={message.id}
                                message={message}
                              />
                              <ResponseMessageActions
                                models={models}
                                chatStatus={message.status}
                                message={message as any}
                                onChangeMessage={handleChangeMessage}
                                onRegenerate={(
                                  messageId: string,
                                  modelId: number,
                                ) => {
                                  handleRegenerate(
                                    message.spanId!,
                                    messageId,
                                    modelId,
                                  );
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })}
                </div>
              );
            })}
            <div className="h-[162px] bg-background" ref={messagesEndRef} />
          </div>
        )}
      </div>
      {hasModel() && (
        <ChatInput
          onSend={(message) => {
            const lastMessage = getSelectedMessagesLastActiveMessage();
            handleSend(message, lastMessage?.id);
          }}
          model={selectModel!}
          onScrollDownClick={handleScrollDown}
          showScrollDownButton={showScrollDownButton}
          onChangePrompt={onChangePrompt}
        />
      )}
      {!hasModel() && !selectedChat?.id && <NoModel />}
    </div>
  );
});
Chat.displayName = 'Chat';
export default Chat;
