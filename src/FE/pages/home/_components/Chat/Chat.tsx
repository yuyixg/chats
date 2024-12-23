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
  formatMessages,
  getSelectedMessages,
} from '@/utils/message';
import { throttle } from '@/utils/throttle';
import { getUserSession } from '@/utils/user';

import {
  ChatBody,
  ChatRole,
  Content,
  ContentRequest,
  Message,
  Role,
} from '@/types/chat';
import {
  ChatMessage,
  SseResponseKind,
  SseResponseLine,
} from '@/types/chatMessage';
import { Prompt } from '@/types/prompt';

import ResponseMessage from '@/components/ChatMessage/ResponseMessage';
import ResponseMessageActions from '@/components/ChatMessage/ResponseMessageActions';
import UserMessage from '@/components/ChatMessage/UserMessage';
import { IconRobot } from '@/components/Icons';

import {
  setChatStatus,
  setChats,
  setMessageIsStreaming,
  setStopIds,
} from '../../_actions/chat.actions';
import {
  setCurrentMessages,
  setLastMessageId,
  setMessages,
  setSelectedMessages,
} from '../../_actions/message.actions';
import { setTemperature } from '../../_actions/userModelConfig.actions';
import HomeContext from '../../_contexts/home.context';
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import ChatModelSetting from './ChatModelSetting';
import MemoizedChatMessage from './MemoizedChatMessage';
import NoModel from './NoModel';

import { cn } from '@/lib/utils';

const Chat = memo(() => {
  const { t } = useTranslation();
  const {
    state: {
      prompt,
      temperature,
      enableSearch,

      chats,
      selectedChat,
      chatError,
      messageIsStreaming,

      messages,
      selectedMessages,
      currentChatMessageId,
      currentMessages,

      models,
      selectModel,
    },
    handleCreateNewChat,
    handleStartChat,
    handleChatIsError,
    handleStopChats,

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

  const updateChatStatus = (status: boolean) => {
    chatDispatch(setChatStatus(status));
  };

  // const updateSelectedMessage = (messageId: string) => {
  //   const selectMessageList = getSelectedMessages(currentMessages, messageId);
  //   messageDispatch(setSelectedMessages(selectMessageList));
  // };
  const ResponseMessageTempId = 'RESPONSE_MESSAGE_TEMP_ID';
  const UserMessageTempId = 'USER_MESSAGE_TEMP_ID';
  const generateResponseMessages = (parentId?: string) => {
    return selectedChat.spans.map((x) => {
      return {
        spanId: x.spanId,
        id: `${ResponseMessageTempId}-${x.spanId}`,
        role: ChatRole.Assistant,
        parentId: parentId,
        siblingIds: [],
        isActive: false,
        content: { text: '' },
        inputTokens: 0,
        outputTokens: 0,
        inputPrice: 0,
        outputPrice: 0,
        modelName: x?.modelName,
        modelId: x?.modelId,
        reasoningTokens: 0,
        duration: 0,
        firstTokenLatency: 0,
      } as ChatMessage;
    });
  };

  const generateUserMessage = (content: Content, parentId?: string) => {
    return {
      spanId: null,
      id: UserMessageTempId,
      role: ChatRole.User,
      parentId,
      siblingIds: [],
      isActive: false,
      content,
    } as ChatMessage;
  };

  const updateSelectedResponseMessageText = (
    messages: ChatMessage[][],
    messageId: string,
    text: string,
  ) => {
    const messageCount = messages.length - 1;
    let messageList = messages[messageCount];
    messageList.map((x) => {
      if (x.id === messageId) {
        x.content.text += text;
      }
      return x;
    });
    messages.splice(messageCount, 1, messageList);
    messageDispatch(setSelectedMessages(messages));
  };

  const updateSelectedUserMessage = (
    messages: ChatMessage[][],
    message: ChatMessage,
  ) => {
    const index = messages.findIndex((x) =>
      x.find((m) => m.id === UserMessageTempId),
    );
    messages.splice(index, 1, [message]);
    messageDispatch(setSelectedMessages(messages));
  };

  const handleSend = useCallback(
    async (
      message: Message,
      messageId?: string,
      isRegenerate: boolean = false,
    ) => {
      updateChatStatus(false);
      let { id: chatId, spans: chatSpans } = selectedChat;
      let userMessage = generateUserMessage(message.content, messageId);
      let responseMessages = generateResponseMessages(messageId);
      let selectedMessageList = [...selectedMessages];
      selectedMessageList.push([userMessage]);
      selectedMessageList.push(responseMessages);
      messageDispatch(setSelectedMessages(selectedMessageList));

      let chatBody = {
        chatId,
        spans: chatSpans.map((x) => ({
          spanId: x.spanId,
          systemPrompt: '你是AI智能助手Sdcb Chats，请仔细遵循用户指令并回复，当前日期: 2024/12/23',
        })),
        messageId: messageId || null,
        userMessage: message,
      };

      const response = await fetch(`${getApiUrl()}/api/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getUserSession()}`,
        },
        body: JSON.stringify(chatBody),
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
      let isErrorChat = false;
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
          const messageId = `${ResponseMessageTempId}-${value.i}`;
          updateSelectedResponseMessageText(
            selectedMessages,
            messageId,
            value.r,
          );
        } else if (value.k === SseResponseKind.Error) {
          isErrorChat = true;
          updateChatStatus(isErrorChat);
          // setSelectMessages({ text, error: value.r });
        } else if (value.k === SseResponseKind.UserMessage) {
          const message = value.r;
          message && updateSelectedUserMessage(selectedMessages, message);
          // newMessages = newMessages.map((m) => {
          //   if (requestMessage && m.id === MESSAGE_TEMP_ID) {
          //     m = { ...m, ...requestMessage };
          //   }
          //   return m;
          // });
        } else if (value.k === SseResponseKind.ResponseMessage) {
          const message = value.r;
          // newMessages = newMessages.map((m) => {
          //   if (m.id === ASSISTANT_MESSAGE_TEMP_ID) {
          //     m = { ...m, ...responseMessage };
          //   }
          //   return m;
          // });
          // const messageList = formatMessages(newMessages);
          // messageDispatch(setMessages(newMessages));
          // messageDispatch(setCurrentMessages(messageList));
          // const lastMessage = messageList[messageList.length - 1];
          // const selectedMessageList = getSelectedMessages(
          //   messageList,
          //   lastMessage.id,
          // );
          // messageDispatch(setSelectedMessages(selectedMessageList));
          // messageDispatch(setLastMessageId(lastMessage.id));
        } else if (value.k === SseResponseKind.UpdateTitle) {
          updateChatTitle(value.r);
        } else if (value.k === SseResponseKind.TitleSegment) {
          updateChatTitle(value.r, true);
        }
      }
      chatDispatch(setMessageIsStreaming(false));

      // let selectChatId = selectedChat?.id;
      // let newMessages = [...messages];
      // let newSelectedMessages = [...selectedMessages];
      // let assistantParentId = messageId;
      // if (!selectChatId) {
      //   const newChat = await handleCreateNewChat();
      //   selectChatId = newChat.id;
      // }
      // let selectedMessageId = messageId;
      // const MESSAGE_TEMP_ID = 'userMessageTempId';
      // if (messageId && isRegenerate) {
      //   const messageIndex = newSelectedMessages.findIndex(
      //     (x) => x.id === messageId,
      //   );
      //   newSelectedMessages.splice(
      //     messageIndex + 1,
      //     newSelectedMessages.length,
      //   );
      // } else {
      //   assistantParentId = MESSAGE_TEMP_ID;
      //   selectedMessageId = MESSAGE_TEMP_ID;
      //   const parentMessage = newSelectedMessages.find(
      //     (x) => x.id == messageId,
      //   );
      //   parentMessage && parentMessage?.childrenIds?.unshift(MESSAGE_TEMP_ID);
      //   const parentMessageIndex = newSelectedMessages.findIndex(
      //     (x) => x.id == messageId,
      //   );
      //   const newUserMessage = {
      //     id: MESSAGE_TEMP_ID,
      //     role: 'user' as Role,
      //     parentId: messageId,
      //     childrenIds: [],
      //     assistantChildrenIds: [],
      //     content: message.content,
      //     inputTokens: 0,
      //     outputTokens: 0,
      //     inputPrice: 0,
      //     outputPrice: 0,
      //   };
      //   let removeCount = -1;
      //   if (parentMessageIndex !== -1)
      //     removeCount = newSelectedMessages.length - 1;
      //   if (!messageId) {
      //     removeCount = newSelectedMessages.length;
      //     messageDispatch(
      //       setCurrentMessages([...currentMessages, newUserMessage]),
      //     );
      //   }
      //   newSelectedMessages.splice(
      //     parentMessageIndex + 1,
      //     removeCount,
      //     newUserMessage,
      //   );
      //   newMessages.push(newUserMessage);
      // }
      // const ASSISTANT_MESSAGE_TEMP_ID = 'assistantMessageTempId';
      // const newAssistantMessage = {
      //   id: ASSISTANT_MESSAGE_TEMP_ID,
      //   role: 'assistant' as Role,
      //   parentId: assistantParentId,
      //   childrenIds: [],
      //   assistantChildrenIds: [],
      //   content: {
      //     image: [],
      //     text: '',
      //   },
      //   inputTokens: 0,
      //   outputTokens: 0,
      //   inputPrice: 0,
      //   outputPrice: 0,
      // };
      // newSelectedMessages.push(newAssistantMessage);
      // newMessages.push(newAssistantMessage);
      // handleStartChat(
      //   newSelectedMessages,
      //   selectedMessageId,
      //   ASSISTANT_MESSAGE_TEMP_ID,
      // );
      // const messageContent: ContentRequest = {
      //   text: message.content.text!,
      //   fileIds: message.content.fileIds?.map((x) => x.id) || null,
      // };
      // const chatBody: ChatBody = {
      //   modelId: modelId || selectModel?.modelId!,
      //   chatId: selectChatId,
      //   messageId: messageId || null,
      //   userMessage: messageContent,
      //   userModelConfig: {
      //     prompt:
      //       selectModel && !selectModel.allowSystemPrompt && prompt
      //         ? null
      //         : prompt,
      //     temperature,
      //     enableSearch,
      //   },
      // };
      // let body = JSON.stringify(chatBody);
      // const response = await fetch(`${getApiUrl()}/api/chats`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${getUserSession()}`,
      //   },
      //   body,
      // });
      // const data = response.body;
      // if (!response.ok) {
      //   handleChatIsError();
      //   const result = await response.json();
      //   toast.error(t(result?.message) || response.statusText);
      //   return;
      // }
      // if (!data) {
      //   handleChatIsError();
      //   return;
      // }
      // let isErrorChat = false;
      // let text = '';
      // const reader = data.getReader();
      // const decoder = new TextDecoder();
      // let buffer = '';
      // function setSelectMessages(content: Content) {
      //   let lastMessages = newSelectedMessages[newSelectedMessages.length - 1];
      //   lastMessages = {
      //     ...lastMessages,
      //     content,
      //   };
      //   newSelectedMessages.splice(-1, 1, lastMessages);
      //   messageDispatch(setSelectedMessages([...newSelectedMessages]));
      // }
      // async function* processBuffer() {
      //   while (true) {
      //     const { done, value } = await reader.read();
      //     if (done) {
      //       break;
      //     }
      //     buffer += decoder.decode(value, { stream: true });
      //     let newlineIndex;
      //     while ((newlineIndex = buffer.indexOf('\r\n\r\n')) >= 0) {
      //       const line = buffer.slice(0, newlineIndex + 1).trim();
      //       buffer = buffer.slice(newlineIndex + 1);
      //       if (line.startsWith('data: ')) {
      //         yield line.slice(6);
      //       }
      //       if (line === '') {
      //         continue;
      //       }
      //     }
      //   }
      // }
      // for await (const message of processBuffer()) {
      //   const value: SseResponseLine = JSON.parse(message);
      //   if (value.k === SseResponseKind.StopId) {
      //     chatDispatch(setStopIds([value.r]));
      //   } else if (value.k === SseResponseKind.Segment) {
      //     text += value.r;
      //     setSelectMessages({ text });
      //   } else if (value.k === SseResponseKind.Error) {
      //     isErrorChat = true;
      //     updateChatStatus(isErrorChat);
      //     handleStopChats();
      //     setSelectMessages({ text, error: value.r });
      //   } else if (value.k === SseResponseKind.UserMessage) {
      //     const requestMessage = value.r;
      //     newMessages = newMessages.map((m) => {
      //       if (requestMessage && m.id === MESSAGE_TEMP_ID) {
      //         m = { ...m, ...requestMessage };
      //       }
      //       return m;
      //     });
      //   } else if (value.k === SseResponseKind.ResponseMessage) {
      //     const responseMessage = value.r;
      //     newMessages = newMessages.map((m) => {
      //       if (m.id === ASSISTANT_MESSAGE_TEMP_ID) {
      //         m = { ...m, ...responseMessage };
      //       }
      //       return m;
      //     });
      //     const messageList = formatMessages(newMessages);
      //     messageDispatch(setMessages(newMessages));
      //     messageDispatch(setCurrentMessages(messageList));
      //     const lastMessage = messageList[messageList.length - 1];
      //     const selectedMessageList = getSelectedMessages(
      //       messageList,
      //       lastMessage.id,
      //     );
      //     messageDispatch(setSelectedMessages(selectedMessageList));
      //     messageDispatch(setLastMessageId(lastMessage.id));
      //   } else if (value.k === SseResponseKind.UpdateTitle) {
      //     updateChatTitle(value.r);
      //   } else if (value.k === SseResponseKind.TitleSegment) {
      //     updateChatTitle(value.r, true);
      //   }
      // }
      // chatDispatch(setMessageIsStreaming(false));
    },
    [
      prompt,
      temperature,
      enableSearch,
      chats,
      selectedChat,
      chatError,
      currentMessages,
      selectedMessages,
      selectModel,
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
  }, [selectedMessages, throttledScrollDown]);

  useEffect(() => {}, [prompt, temperature, enableSearch]);

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
      <>
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
                        : 'grid grid-flow-row md:grid-flow-col gap-4',
                    )}
                  >
                    {messages.map((message) => {
                      const model = selectedChat.spans.find(
                        (x) => x.spanId === message.spanId,
                      );
                      return (
                        <>
                          {message.role === ChatRole.User && (
                            <div
                              key={'user-message-' + message.id}
                              className="prose w-full dark:prose-invert rounded-r-md"
                            >
                              <UserMessage
                                selectedChat={selectedChat}
                                messageIsStreaming={messageIsStreaming}
                                message={message}
                                onChangeMessage={() => {}}
                                onEdit={() => {}}
                              />
                            </div>
                          )}
                          {message.role === ChatRole.Assistant && (
                            <div
                              key={'response-message-' + message.id}
                              className={cn(
                                'border-[0.1px] rounded-md p-4',
                                message.isActive && 'border-[1.6px]',
                              )}
                            >
                              <div className="prose dark:prose-invert rounded-r-md">
                                <ResponseMessage
                                  messageIsStreaming={messageIsStreaming}
                                  currentChatMessageId={message.id}
                                  message={message}
                                  onActiveMessage={(messageId: string) => {
                                    handelMessageActive(messageId);
                                  }}
                                />
                                <ResponseMessageActions
                                  models={models}
                                  messageIsStreaming={messageIsStreaming}
                                  message={message as any}
                                  modelName={model?.modelName}
                                  modelId={model?.modelId}
                                  onChangeMessage={() => {}}
                                  onRegenerate={() => {}}
                                />
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })}
                  </div>
                );
                // <>{messages.map((m) => {
                //   if(m.role === ChatRole.User) {
                //     return
                //   }
                // })}</>;
                // let lastMessage = selectedMessages[selectedMessages.length - 1];
                // let parentChildrenIds: string[] = [];
                // if (!current.parentId) {
                //   parentChildrenIds = currentMessages
                //     .filter((x) => !x.parentId)
                //     .map((x) => x.id);
                // } else {
                //   parentChildrenIds =
                //     currentMessages.find((x) => x.id === current.parentId)
                //       ?.childrenIds || [];
                //   parentChildrenIds = [...parentChildrenIds].reverse();
                // }
                // return (
                //   <MemoizedChatMessage
                //     models={models}
                //     selectedChat={selectedChat}
                //     key={current.id + index}
                //     modelName={current.modelName}
                //     modelId={current.modelId}
                //     currentSelectIndex={parentChildrenIds.findIndex(
                //       (x) => x === current.id,
                //     )}
                //     parentId={current.parentId}
                //     childrenIds={current.childrenIds!}
                //     parentChildrenIds={parentChildrenIds}
                //     assistantChildrenIds={current.assistantChildrenIds!}
                //     assistantCurrentSelectIndex={current.assistantChildrenIds!.findIndex(
                //       (x) => x === current.id,
                //     )}
                //     lastMessageId={lastMessage.id}
                //     message={{
                //       id: current.id!,
                //       role: current.role,
                //       content: current.content,
                //       duration: current.duration || 0,
                //       firstTokenLatency: current.firstTokenLatency || 0,
                //       inputTokens: current.inputTokens || 0,
                //       outputTokens: current.outputTokens || 0,
                //       reasoningTokens: current.reasoningTokens || 0,
                //       inputPrice: current.inputPrice || 0,
                //       outputPrice: current.outputPrice || 0,
                //     }}
                //     messageIsStreaming={messageIsStreaming}
                //     currentChatMessageId={currentChatMessageId}
                //     chatError={chatError}
                //     onChangeMessage={(messageId) => {
                //       updateSelectedMessage(messageId);
                //     }}
                //     onRegenerate={(modelId?: number) => {
                //       const message = currentMessages.find(
                //         (x) => x.id === current.parentId,
                //       );
                //       if (!message) return;
                //       handleSend(
                //         { role: 'user', content: message.content },
                //         current.parentId || '',
                //         true,
                //         modelId,
                //       );
                //     }}
                //     onEdit={(editedMessage, parentId) => {
                //       handleSend(editedMessage, parentId || '', false);
                //     }}
                //   />
                // );
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
      </>
    </div>
  );
});
Chat.displayName = 'Chat';
export default Chat;
