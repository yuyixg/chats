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
import { currentISODateString } from '@/utils/date';
import {
  findLastLeafId,
  findSelectedMessageByLeafId,
  generateResponseMessage,
  generateResponseMessages,
  generateUserMessage,
} from '@/utils/message';
import { throttle } from '@/utils/throttle';
import { getUserSession } from '@/utils/user';

import {
  ChatRole,
  ChatSpanStatus,
  ChatStatus,
  Content,
  Message,
} from '@/types/chat';
import {
  IChatMessage,
  ReactionMessageType,
  ResponseMessageTempId,
  SseResponseKind,
  SseResponseLine,
} from '@/types/chatMessage';
import { PutResponseMessageEditAndSaveNewResult } from '@/types/clientApis';
import { Prompt } from '@/types/prompt';

import {
  setChats,
  setSelectedChat,
  setStopIds,
} from '../../_actions/chat.actions';
import {
  setMessages,
  setSelectedMessages,
} from '../../_actions/message.actions';
import HomeContext from '../../_contexts/home.context';
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import ChatModelSetting from './ChatModelSetting';
import ChatMessageMemoized from './MemoizedChatMessage';
import NoModel from './NoModel';

import {
  putChats,
  putMessageReactionClear,
  putMessageReactionUp,
  putResponseMessageEditAndSaveNew,
  putResponseMessageEditInPlace,
} from '@/apis/clientApis';

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
    selectedMsgs: IChatMessage[][],
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
          systemPrompt: x.prompt || defaultPrompt?.content,
          setsTemperature: true,
          enableSearch: x.enableSearch,
          temperature: x.temperature,
        })),
        timezoneOffset: new Date().getTimezoneOffset(),
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
      timezoneOffset: new Date().getTimezoneOffset(),
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
    const { text: contentText, fileIds } = message.content;

    let chatBody = {
      chatId,
      spanIds: chatSpans.map((x) => x.spanId),
      parentAssistantMessageId: messageId || null,
      userMessage: {
        text: contentText,
        fileIds: fileIds?.map((x) => x.id),
      },
      timezoneOffset: new Date().getTimezoneOffset(),
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
    selectedMessageList: IChatMessage[][],
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

    const leafMessageId = messageList[messageList.length - 1].id;
    const selectedMsgs = findSelectedMessageByLeafId(
      messageList,
      leafMessageId,
    );

    const chatList = chats.map((x) =>
      x.id === selectedChat.id
        ? { ...x, updatedAt: currentISODateString() }
        : x,
    );

    chatDispatch(setChats(chatList));
    messageDispatch(setSelectedMessages(selectedMsgs));
    messageDispatch(setMessages(messageList));
    changeSelectedChatStatus(ChatStatus.None);
  };

  const handleUpdateResponseMessage = async (
    messageId: string,
    content: Content,
    isCopy: boolean = false,
  ) => {
    let data: PutResponseMessageEditAndSaveNewResult;
    const params = {
      messageId,
      content: { ...content, fileIds: content.fileIds?.map((x) => x.id) || [] },
    };
    if (isCopy) {
      data = await putResponseMessageEditAndSaveNew(params);
    } else {
      await putResponseMessageEditInPlace(params);
    }

    let msgs = [...messages],
      copyMsg: IChatMessage;

    let messageIndex = messages.findIndex(
      (x) => x.id === messageId && x.role === ChatRole.Assistant,
    );

    let msgGroupIndex = 0,
      msgIndex = 0;
    let selectedMsgs = selectedMessages.map((msg, groupIndex) => {
      return msg.map((m, i) => {
        msgGroupIndex = groupIndex;
        msgIndex = i;
        if (m.id === messageId && m.role === ChatRole.Assistant) {
          const msgSiblingIds = isCopy
            ? [...m.siblingIds, data.id]
            : m.siblingIds;
          copyMsg = {
            ...m,
            id: data?.id,
            content,
            siblingIds: msgSiblingIds,
          };

          return {
            ...m,
            content: isCopy ? m.content : content,
            siblingIds: msgSiblingIds,
          };
        }
        return m;
      });
    });

    if (isCopy) {
      msgs.splice(messageIndex + 1, 0, copyMsg!);
      selectedMsgs[msgGroupIndex][msgIndex] = copyMsg!;
    }
    messageDispatch(setMessages(msgs));
    messageDispatch(setSelectedMessages(selectedMsgs));
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

  const handleChangePrompt = (prompt: Prompt) => {
    // to do
  };

  const handleChangeChatLeafMessageId = (messageId: string) => {
    if (selectedChat.status === ChatStatus.Chatting) return;
    const leafId = findLastLeafId(messages, messageId);
    const selectedMsgs = findSelectedMessageByLeafId(messages, leafId);
    messageDispatch(setSelectedMessages(selectedMsgs));
    chatDispatch(
      setSelectedChat({ ...selectedChat, leafMessageId: messageId }),
    );
    const chatList = chats.map((x) =>
      x.id === selectedChat.id
        ? { ...x, updatedAt: currentISODateString() }
        : x,
    );
    chatDispatch(setChats(chatList));
    putChats(selectedChat.id, {
      setsLeafMessageId: true,
      leafMessageId: leafId,
    });
  };

  const handleReactionMessage = (
    type: ReactionMessageType,
    messageId: string,
  ) => {
    const message = messages.find((m) => m.id === messageId);
    let p = null;
    let reaction: boolean | null = null;

    if (type === ReactionMessageType.Good) {
      if (message?.reaction) {
        p = putMessageReactionClear(messageId);
      } else {
        reaction = true;
        p = putMessageReactionUp(messageId);
      }
    } else {
      if (message?.reaction === false) {
        p = putMessageReactionClear(messageId);
      } else {
        reaction = false;
        p = putMessageReactionUp(messageId);
      }
    }

    p.then(() => {
      const msgs = messages.map((m) =>
        m.id === messageId ? { ...m, reaction } : m,
      );
      const selectedMsgs = selectedMessages.map((msg) => {
        return msg.map((m) => (m.id === message?.id ? { ...m, reaction } : m));
      });
      messageDispatch(setSelectedMessages(selectedMsgs));
      messageDispatch(setMessages(msgs));
    });
  };

  return (
    <div className="relative flex-1">
      <div
        className="relative max-h-full overflow-x-hidden scroll-container"
        ref={chatContainerRef}
        onScroll={handleScroll}
      >
        {selectedChat && <ChatHeader />}

        {selectedChat && selectedMessages.length === 0 && <ChatModelSetting />}

        <ChatMessageMemoized
          selectedChat={selectedChat}
          selectedMessages={selectedMessages}
          models={models}
          messagesEndRef={messagesEndRef}
          onChangeChatLeafMessageId={handleChangeChatLeafMessageId}
          onEditMessageSend={handleEditMessageSend}
          onRegenerate={handleRegenerate}
          onReactionMessage={handleReactionMessage}
          onEditResponseMessage={handleUpdateResponseMessage}
        />
      </div>
      {hasModel() && selectedChat && (
        <ChatInput
          onSend={(message) => {
            const lastMessage = getSelectedMessagesLastActiveMessage();
            handleSend(message, lastMessage?.id);
          }}
          onScrollDownClick={handleScrollDown}
          showScrollDownButton={showScrollDownButton}
          onChangePrompt={handleChangePrompt}
        />
      )}
      {!hasModel() && !selectedChat?.id && <NoModel />}
    </div>
  );
});
Chat.displayName = 'Chat';
export default Chat;
