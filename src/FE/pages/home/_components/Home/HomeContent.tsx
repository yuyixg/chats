import { useEffect, useReducer } from 'react';

import { useRouter } from 'next/router';

import { useCreateReducer } from '@/hooks/useCreateReducer';
import useTranslation from '@/hooks/useTranslation';

import {
  getPathChatId,
  getStorageChatId,
  setStorageChatId,
} from '@/utils/chats';
import { getSelectMessages } from '@/utils/message';
import { getStorageModelId, setStorageModelId } from '@/utils/model';
import { formatPrompt } from '@/utils/promptVariable';
import { getSettings, saveSettings } from '@/utils/settings';
import { Settings } from '@/utils/settings';
import { getLoginUrl, getUserInfo, getUserSession } from '@/utils/user';

import { AdminModelDto } from '@/types/adminApis';
import { DEFAULT_TEMPERATURE, IChat, Role } from '@/types/chat';
import { ChatMessage } from '@/types/chatMessage';
import { ChatResult, GetChatsParams } from '@/types/clientApis';

import Spinner from '@/components/Spinner/Spinner';

import {
  setChatPaging,
  setChatStatus,
  setChats,
  setMessageIsStreaming,
  setSelectedChat,
} from '../../_actions/chat.actions';
import {
  setCurrentMessageId,
  setCurrentMessages,
  setLastMessageId,
  setMessages,
} from '../../_actions/message.actions';
import HomeContext, {
  HandleUpdateChatParams,
  HomeInitialState,
  initialState,
} from '../../_contexts/home.context';
import chatReducer, { chatInitialState } from '../../_reducers/chat.reducer';
import messageReducer, {
  messageInitialState,
} from '../../_reducers/message.reducer';
import Chat from '../Chat/Chat';
import ChatSettingsBar from '../ChatSettings/ChatSettingsBar';
import Chatbar from '../Chatbar/Chatbar';
import PromptBar from '../Promptbar/Promptbar';

import {
  getChatsByPaging,
  getDefaultPrompt,
  getUserMessages,
  getUserModels,
  getUserPromptBrief,
  postChats,
} from '@/apis/clientApis';

const HomeContent = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [chatState, chatDispatch] = useReducer(chatReducer, chatInitialState);
  const [messageState, messageDispatch] = useReducer(
    messageReducer,
    messageInitialState,
  );
  const { chats } = chatState;
  const { currentMessages } = messageState;

  const contextValue = useCreateReducer<HomeInitialState>({
    initialState,
  });

  const {
    state: { models, user, userModelConfig, settings },
    dispatch,
  } = contextValue;

  const calcSelectModel = (chats: ChatResult[], models: AdminModelDto[]) => {
    const model = models.find((x) => x.modelId === chats[0]?.modelId);
    if (model) return model;
    else return models.length > 0 ? models[0] : undefined;
  };

  const getChatModel = (
    chats: ChatResult[],
    chatId: string,
    models: AdminModelDto[],
  ) => {
    const chatModelId = chats.find((x) => x.id === chatId)?.modelId;
    const model = models.find((x) => x.modelId === chatModelId);
    return model;
  };

  const chatErrorMessage = (messageId: string): ChatMessage => {
    return {
      id: 'errorMessageTempId',
      parentId: messageId,
      childrenIds: [],
      assistantChildrenIds: [],
      role: 'assistant' as Role,
      content: { text: '', fileIds: [] },
      inputTokens: 0,
      outputTokens: 0,
      inputPrice: 0,
      outputPrice: 0,
    };
  };

  const handleSelectModel = (model: AdminModelDto) => {
    if (!model) return;
    dispatch({ field: 'selectModel', value: model });
    const initialConfig = {
      enableSearch: model.allowSearch ? false : null,
    };
    handleUpdateUserModelConfig(initialConfig);

    getDefaultPrompt().then((data) => {
      handleUpdateUserModelConfig({
        ...initialConfig,
        temperature:
          data.temperature ??
          userModelConfig?.temperature ??
          DEFAULT_TEMPERATURE,
        prompt: formatPrompt(data.content, { model }),
      });
    });
  };

  const handleCreateNewChat = async () => {
    const chat = await postChats({ title: t('New Conversation') });
    chats.unshift(chat);
    chatDispatch(setChats([...chats]));
    chatDispatch(setSelectedChat(chat));
    messageDispatch(setMessages([]));
    messageDispatch(setCurrentMessages([]));
    return chat;
  };

  const handleUpdateChatStatus = (status: boolean) => {
    chatDispatch(setChatStatus(status));
  };

  const handleChatIsError = () => {
    chatDispatch(setChatStatus(true));
    chatDispatch(setMessageIsStreaming(false));
  };

  const handleStartChat = (
    selectedMessages: ChatMessage[],
    selectedMessageId: string,
    currentMessageId: string,
  ) => {
    chatDispatch(setMessageIsStreaming(true));
    messageDispatch(setMessages(selectedMessages));
    messageDispatch(setLastMessageId(selectedMessageId));
    messageDispatch(setCurrentMessageId(currentMessageId));
  };

  const handleNewChat = () => {
    postChats({ title: t('New Conversation') }).then((data) => {
      const model = calcSelectModel(chats, models);
      chatDispatch(setChats([data, ...chats]));
      chatDispatch(setSelectedChat(data));
      chatDispatch(setChatStatus(false));

      messageDispatch(setLastMessageId(''));
      messageDispatch(setMessages([]));
      messageDispatch(setCurrentMessages([]));
      handleSelectModel(model!);
      router.push('#/' + data.id);
    });
  };

  const handleUpdateCurrentMessage = (chatId: string) => {
    getUserMessages(chatId).then((data) => {
      if (data.length > 0) {
        messageDispatch(setCurrentMessages(data));
        const lastMessage = data[data.length - 1];
        const selectMessageList = getSelectMessages(data, lastMessage.id);
        messageDispatch(setMessages(selectMessageList));
        messageDispatch(setLastMessageId(lastMessage.id));
      } else {
        messageDispatch(setMessages([]));
        messageDispatch(setCurrentMessages([]));
      }
    });
  };

  const handleSelectChat = (chat: IChat) => {
    chatDispatch(setChatStatus(false));
    chatDispatch(setSelectedChat(chat));
    const selectModel =
      getChatModel(chats, chat.id, models) || calcSelectModel(chats, models);
    selectModel && setStorageModelId(selectModel.modelId);
    getUserMessages(chat.id).then((data) => {
      if (data.length > 0) {
        messageDispatch(setCurrentMessages(data));
        const lastMessage = data[data.length - 1];
        const selectMessageList = getSelectMessages(data, lastMessage.id);
        if (lastMessage.role !== 'assistant') {
          chatDispatch(setChatStatus(true));
          selectMessageList.push(chatErrorMessage(lastMessage.id));
        }

        messageDispatch(setMessages(selectMessageList));
        messageDispatch(setLastMessageId(lastMessage.id));

        dispatch({ field: 'userModelConfig', value: chat.userModelConfig });
        dispatch({
          field: 'selectModel',
          value: selectModel,
        });
      } else {
        handleSelectModel(selectModel!);
        messageDispatch(setMessages([]));
        messageDispatch(setCurrentMessages([]));
      }
    });
    router.push('#/' + chat.id);
    setStorageChatId(chat.id);
  };

  const handleUpdateSelectMessage = (messageId: string) => {
    const selectMessageList = getSelectMessages(currentMessages, messageId);
    messageDispatch(setMessages(selectMessageList));
  };

  const handleUpdateUserModelConfig = (value: any) => {
    dispatch({
      field: 'userModelConfig',
      value: { ...userModelConfig, ...value },
    });
  };

  const handleUpdateSettings = <K extends keyof Settings>(
    key: K,
    value: Settings[K],
  ) => {
    settings[key] = value;
    dispatch({ field: 'settings', value: settings });
    saveSettings(settings);
  };

  const hasModel = () => {
    return models?.length > 0;
  };

  const selectChat = (
    chatList: ChatResult[],
    chatId: string | null,
    models: AdminModelDto[],
  ) => {
    const chat = chatList.find((x) => x.id === chatId);
    if (chat) {
      chatDispatch(setSelectedChat(chat));

      getUserMessages(chat.id).then((data) => {
        if (data.length > 0) {
          messageDispatch(setCurrentMessages(data));
          const lastMessage = data[data.length - 1];
          const selectMessageList = getSelectMessages(data, lastMessage.id);
          if (lastMessage.role !== 'assistant') {
            chatDispatch(setChatStatus(true));
            selectMessageList.push(chatErrorMessage(lastMessage.id));
          }
          messageDispatch(setMessages(selectMessageList));
          messageDispatch(setLastMessageId(lastMessage.id));
        } else {
          messageDispatch(setCurrentMessages([]));
          messageDispatch(setMessages([]));
        }
        const model =
          getChatModel(chatList, chat?.id, models) ||
          calcSelectModel(chatList, models);
        handleSelectModel(model!);
      });
    }
  };

  const getSelectedChat = (chatList: ChatResult[]) => {
    let chatId = getPathChatId(router.asPath) || getStorageChatId();
    if (chatList.length > 0)
      return chatList.find((x) => x.id === chatId) || chatList[0];
    return {} as IChat;
  };

  const handleUpdateChat = (
    chats: ChatResult[],
    id: string,
    params: HandleUpdateChatParams,
  ) => {
    const chatList = chats.map((x) => {
      if (x.id === id) return { ...x, ...params };
      return x;
    });
    chatDispatch(setChats(chatList));
  };

  const handleUpdateChats = (chats: IChat[]) => {
    chatDispatch(setChats(chats));
  };

  const handleDeleteChat = (id: string) => {
    const chatList = chats.filter((x) => {
      return x.id !== id;
    });
    chatDispatch(setChats(chatList));
    chatDispatch(setSelectedChat(undefined));
    chatDispatch(setChatStatus(false));

    messageDispatch(setLastMessageId(''));
    messageDispatch(setMessages([]));
    messageDispatch(setCurrentMessages([]));

    dispatch({
      field: 'selectModel',
      value: calcSelectModel(chats, models),
    });
    dispatch({ field: 'userModelConfig', value: {} });
  };

  const getChats = (params: GetChatsParams, modelList?: AdminModelDto[]) => {
    const { page, pageSize } = params;
    getChatsByPaging(params).then((data) => {
      const { rows, count } = data || { rows: [], count: 0 };
      let chatList = rows;
      if (!modelList) {
        chatList = chats.concat(rows);
      }
      chatDispatch(setChats(chatList));
      chatDispatch(setChatPaging({ count, page, pageSize }));
      if (modelList) {
        const selectChatId = getPathChatId(router.asPath) || getStorageChatId();
        selectChat(rows, selectChatId, modelList || models);
      }
    });
  };

  useEffect(() => {
    const settings = getSettings();
    dispatch({
      field: 'settings',
      value: settings,
    });
  }, []);

  useEffect(() => {
    const session = getUserInfo();
    const sessionId = getUserSession();
    if (session && sessionId) {
      setTimeout(() => {
        dispatch({ field: 'user', value: session });
      }, 1000);
    } else {
      router.push(getLoginUrl());
    }
    if (sessionId) {
      getUserModels().then((modelData) => {
        dispatch({ field: 'models', value: modelData });
        if (modelData && modelData.length > 0) {
          const selectModelId = getStorageModelId();
          const model =
            modelData.find((x) => x.modelId.toString() === selectModelId) ??
            modelData[0];
          if (model) {
            setStorageModelId(model.modelId);
            handleSelectModel(model);
          }
        }

        getChats({ page: 1, pageSize: 50 }, modelData);
      });

      getUserPromptBrief().then((data) => {
        dispatch({ field: 'prompts', value: data });
      });
    }
  }, []);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const chatId = getPathChatId(event.state?.as || '');
      selectChat(chats, chatId, models);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [chats]);

  return (
    <HomeContext.Provider
      value={{
        ...contextValue,
        state: { ...contextValue.state, ...chatState, ...messageState },
        chatDispatch: chatDispatch,
        messageDispatch: messageDispatch,

        handleNewChat,
        handleStartChat,
        handleChatIsError,
        handleUpdateChatStatus,
        handleUpdateChats,

        handleCreateNewChat,
        handleSelectChat,
        handleUpdateChat,
        handleDeleteChat,
        handleSelectModel,
        handleUpdateSelectMessage,
        handleUpdateCurrentMessage,
        handleUpdateUserModelConfig,
        handleUpdateSettings,
        hasModel,
        getChats,
      }}
    >
      {!user && (
        <div
          className={`fixed top-0 left-0 bottom-0 right-0 bg-background z-50 text-center text-[12.5px]`}
        >
          <div className="fixed w-screen h-screen top-1/2">
            <div className="flex justify-center">
              <Spinner className="text-gray-500 dark:text-gray-50" />
            </div>
          </div>
        </div>
      )}
      <div className={`flex h-screen w-screen flex-col text-sm`}>
        <div className="flex h-full w-full bg-background">
          <Chatbar />
          <div className="flex w-full">
            <Chat />
          </div>
          {settings.showPromptBar && <PromptBar />}
          <ChatSettingsBar />
        </div>
      </div>
    </HomeContext.Provider>
  );
};

export default HomeContent;
