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
import {
  findLastLeafId,
  findSelectedMessageByLeafId,
  generateResponseMessage,
  generateResponseMessages,
  generateUserMessage,
} from '@/utils/message';
import { throttle } from '@/utils/throttle';
import { getUserSession } from '@/utils/user';

import { ChatRole, ChatSpanStatus, ChatStatus, Message } from '@/types/chat';
import {
  ChatMessage,
  ResponseMessageTempId,
  SseResponseKind,
  SseResponseLine,
} from '@/types/chatMessage';
import { Prompt } from '@/types/prompt';

import ChatError from '@/components/ChatError/ChatError';
import ResponseMessage from '@/components/ChatMessage/ResponseMessage';
import ResponseMessageActions from '@/components/ChatMessage/ResponseMessageActions';
import UserMessage from '@/components/ChatMessage/UserMessage';

import {
  setChats,
  setSelectedChat,
  setStopIds,
} from '../../_actions/chat.actions';
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

import { putChats } from '@/apis/clientApis';
import { cn } from '@/lib/utils';

const Chat = memo(() => {
  const { t } = useTranslation();
  const {
    state: {
      chats,
      selectedChat,

      messages,
      selectedMessages,

      models,

      defaultPrompt,
    },

    hasModel,
    chatDispatch,
    messageDispatch,
    userModelConfigDispatch,
  } = useContext(HomeContext);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);
  const [showScrollDownButton, setShowScrollDownButton] =
    useState<boolean>(false);
  const hasMultipleSpan = selectedMessages.find((x) => x.length > 1);

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

  const changeChatTitle = (title: string, append: boolean = false) => {
    const newChats = chats.map((chat) => {
      if (chat.id === selectedChat.id) {
        append ? (chat.title += title) : (chat.title = title);
      }
      return chat;
    });
    chatDispatch(setChats(newChats));
  };

  const changeSelectedChatStatus = (status: ChatStatus) => {
    chatDispatch(setSelectedChat({ ...selectedChat, status }));
  };

  const startChat = () => {
    changeSelectedChatStatus(ChatStatus.Chatting);
  };

  const handleChatError = () => {
    changeSelectedChatStatus(ChatStatus.Failed);
  };

  const changeSelectedResponseMessage = (
    selectedMsgs: ChatMessage[][],
    messageId: string,
    text: string,
    status?: ChatSpanStatus,
    finalMessageId?: string,
  ) => {
    const messageCount = selectedMsgs.length - 1;
    let messageList = selectedMsgs[messageCount];
    messageList.map((x) => {
      if (x.id === messageId) {
        x.content.text += text;
        if (status) {
          x.status = status;
          status === ChatSpanStatus.Failed && (x.content.error = text);
          if (status === ChatSpanStatus.None) {
            x.siblingIds.push(messageId);
            x.id = finalMessageId!;
          }
        }
      }
      return x;
    });
    selectedMsgs.splice(messageCount, 1, messageList);
    messageDispatch(setSelectedMessages(selectedMsgs));
  };

  const handleSend = useCallback(
    async (message: Message, messageId?: string) => {
      startChat();
      let { id: chatId, spans: chatSpans } = selectedChat;
      let selectedMessageList = [...selectedMessages];
      let userMessage = generateUserMessage(message.content, messageId);
      selectedMessageList.push([userMessage]);
      let responseMessages = generateResponseMessages(selectedChat, messageId);
      selectedMessageList.push(responseMessages);
      messageDispatch(setSelectedMessages(selectedMessageList));
      const { text: contentText, fileIds } = message.content;
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
        userMessage: {
          text: contentText,
          fileIds: fileIds?.map((x) => x.id),
        },
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
    [chats, selectedChat, selectedMessages],
  );

  const handleRegenerate = async (
    spanId: number,
    messageId: string,
    modelId: number,
  ) => {
    startChat();
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
    startChat();
    let { id: chatId, spans: chatSpans } = selectedChat;
    let index = selectedMessages.findIndex(
      (x) => x.findIndex((m) => m.id === messageId) !== -1,
    );
    index += 1;
    let selectedMessageList = selectedMessages.slice(0, index);
    let userMessage = generateUserMessage(message.content, messageId);
    selectedMessageList.push([userMessage]);
    let responseMessages = generateResponseMessages(selectedChat, messageId);
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
      handleChatError();
      const result = await response.json();
      toast.error(t(result?.message) || response.statusText);
      return;
    }
    if (!data) {
      handleChatError();
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
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
        chatDispatch(setStopIds([value.r]));
      } else if (value.k === SseResponseKind.Segment) {
        const { r: msg, i: spanId } = value;
        const msgId = `${ResponseMessageTempId}-${spanId}`;
        changeSelectedResponseMessage(selectedMessageList, msgId, msg);
      } else if (value.k === SseResponseKind.Error) {
        const { r: msg, i: spanId } = value;
        const msgId = `${ResponseMessageTempId}-${spanId}`;
        changeSelectedResponseMessage(
          selectedMessageList,
          msgId,
          msg,
          ChatSpanStatus.Failed,
        );
      } else if (value.k === SseResponseKind.UserMessage) {
        messageList.push(value.r);
      } else if (value.k === SseResponseKind.ResponseMessage) {
        const { r: msg, i: spanId } = value;
        const msgId = `${ResponseMessageTempId}-${spanId}`;
        changeSelectedResponseMessage(
          selectedMessageList,
          msgId,
          '',
          ChatSpanStatus.None,
        );
        messageList.push(msg);
      } else if (value.k === SseResponseKind.UpdateTitle) {
        changeChatTitle(value.r);
      } else if (value.k === SseResponseKind.TitleSegment) {
        changeChatTitle(value.r, true);
      }
    }

    const selectedMsgs = findSelectedMessageByLeafId(
      messageList,
      messageList[messageList.length - 1].id,
    );
    messageDispatch(setSelectedMessages(selectedMsgs));
    messageDispatch(setMessages(messageList));
    changeSelectedChatStatus(ChatStatus.None);
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

  const handleChangeChatLeafMessageId = (messageId: string) => {
    const leafId = findLastLeafId(messages, messageId);
    if (leafId === selectedChat.leafMessageId) return;
    const selectedMsgs = findSelectedMessageByLeafId(messages, leafId);
    messageDispatch(setSelectedMessages(selectedMsgs));
    chatDispatch(
      setSelectedChat({ ...selectedChat, leafMessageId: messageId }),
    );
    putChats(selectedChat.id, {
      setsLeafMessageId: true,
      leafMessageId: leafId,
    });
  };

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        className="max-h-full overflow-x-hidden scroll-container"
        ref={chatContainerRef}
        onScroll={handleScroll}
      >
        <ChatHeader />

        {selectedMessages.length === 0 && <ChatModelSetting />}

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
                            message={message}
                            onChangeMessage={handleChangeChatLeafMessageId}
                            onEdit={handleEditMessageSend}
                          />
                        </div>
                      )}
                      {message.role === ChatRole.Assistant && (
                        <div
                          onClick={() =>
                            hasMultipleSpan &&
                            handleChangeChatLeafMessageId(message.id)
                          }
                          key={'response-message-' + message.id}
                          className={cn(
                            'border-[1px] rounded-md p-4 flex w-full',
                            hasMultipleSpan &&
                              message.isActive &&
                              'border-primary/50',
                          )}
                        >
                          {/* <ChatIcon
                              className="w-7 h-7 mr-1"
                              providerId={message.modelProviderId!}
                            /> */}
                          <div className="prose dark:prose-invert rounded-r-md">
                            {message.status === ChatSpanStatus.Failed && (
                              <ChatError error={message.content.error} />
                            )}
                            <ResponseMessage message={message} />
                            <ResponseMessageActions
                              models={models}
                              chatStatus={message.status}
                              message={message as any}
                              onChangeMessage={handleChangeChatLeafMessageId}
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
      </div>
      {hasModel() && (
        <ChatInput
          onSend={(message) => {
            const lastMessage = getSelectedMessagesLastActiveMessage();
            handleSend(message, lastMessage?.id);
          }}
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
