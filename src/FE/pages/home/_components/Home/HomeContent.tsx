import { useEffect, useReducer, useState } from 'react';

import { useRouter } from 'next/router';

import { useCreateReducer } from '@/hooks/useCreateReducer';
import useTranslation from '@/hooks/useTranslation';

import {
  getPathChatId,
  getStorageChatId,
  setStorageChatId,
} from '@/utils/chats';
import { formatMessages, getSelectedMessages } from '@/utils/message';
import { getStorageModelId, setStorageModelId } from '@/utils/model';
import { formatPrompt } from '@/utils/promptVariable';
import { getSettings } from '@/utils/settings';
import { getUserSession } from '@/utils/user';

import { AdminModelDto } from '@/types/adminApis';
import { DEFAULT_TEMPERATURE, IChat, Role } from '@/types/chat';
import { ChatMessage } from '@/types/chatMessage';
import { ChatResult, GetChatsParams } from '@/types/clientApis';

import Spinner from '@/components/Spinner/Spinner';

import {
  setChatPaging,
  setChatStatus,
  setChats,
  setIsChatsLoading,
  setMessageIsStreaming,
  setSelectedChat,
  setStopIds,
} from '../../_actions/chat.actions';
import {
  setCurrentMessageId,
  setCurrentMessages,
  setLastMessageId,
  setMessages,
  setSelectedMessages,
} from '../../_actions/message.actions';
import { setModels, setSelectedModel } from '../../_actions/model.actions';
import { setPrompts } from '../../_actions/prompt.actions';
import {
  setShowChatBar,
  setShowPromptBar,
} from '../../_actions/setting.actions';
import { setUserModelConfig } from '../../_actions/userModelConfig.actions';
import HomeContext, {
  HandleUpdateChatParams,
  HomeInitialState,
  initialState,
} from '../../_contexts/home.context';
import chatReducer, { chatInitialState } from '../../_reducers/chat.reducer';
import messageReducer, {
  messageInitialState,
} from '../../_reducers/message.reducer';
import modelReducer, { modelInitialState } from '../../_reducers/model.reducer';
import promptReducer, {
  promptInitialState,
} from '../../_reducers/prompt.reducer';
import settingReducer, {
  settingInitialState,
} from '../../_reducers/setting.reducer';
import userModelConfigReducer, {
  userModelConfigInitialState,
} from '../../_reducers/userModelConfig.reducer';
import Chat from '../Chat/Chat';
import Chatbar from '../Chatbar/Chatbar';
import PromptBar from '../Promptbar/Promptbar';

import {
  getChatsByPaging,
  getDefaultPrompt,
  getUserMessages,
  getUserModels,
  getUserPromptBrief,
  postChats,
  stopChat,
} from '@/apis/clientApis';

const HomeContent = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [chatState, chatDispatch] = useReducer(chatReducer, chatInitialState);
  const [messageState, messageDispatch] = useReducer(
    messageReducer,
    messageInitialState,
  );
  const [modelState, modelDispatch] = useReducer(
    modelReducer,
    modelInitialState,
  );
  const [userModelConfigState, userModelConfigDispatch] = useReducer(
    userModelConfigReducer,
    userModelConfigInitialState,
  );
  const [settingState, settingDispatch] = useReducer(
    settingReducer,
    settingInitialState,
  );
  const [promptState, promptDispatch] = useReducer(
    promptReducer,
    promptInitialState,
  );

  const { chats, stopIds } = chatState;
  const { models } = modelState;
  const { temperature } = userModelConfigState;
  const { showPromptBar } = settingState;
  const [isPageLoading, setIsPageLoading] = useState(true);

  const contextValue = useCreateReducer<HomeInitialState>({
    initialState,
  });

  const calcSelectModel = (chats: ChatResult[], models: AdminModelDto[]) => {
    // const model = models.find((x) => x.modelId === chats[0]?.spans[0].modelId); // todo
    // if (model) return model;
    // else
    return models.length > 0 ? models[0] : undefined;
  };

  const getChatModel = (
    chats: ChatResult[],
    chatId: string,
    models: AdminModelDto[],
  ) => {
    const chatModelId = chats.find((x) => x.id === chatId)?.spans[0].modelId; // todo
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
    modelDispatch(setSelectedModel(model));
    const initialConfig = {
      enableSearch: model.allowSearch ? false : null,
    };

    getDefaultPrompt().then((data) => {
      userModelConfigDispatch(
        setUserModelConfig({
          ...initialConfig,
          temperature: data.temperature ?? temperature ?? DEFAULT_TEMPERATURE,
          prompt: formatPrompt(data?.content || '', { model }),
        }),
      );
    });
  };

  const handleCreateNewChat = async () => {
    const chat = await postChats({ title: t('New Conversation') });
    chats.unshift(chat);
    chatDispatch(setChats([...chats]));
    chatDispatch(setSelectedChat(chat));
    messageDispatch(setMessages([]));
    messageDispatch(setSelectedMessages([]));
    messageDispatch(setCurrentMessages([]));
    return chat;
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
    messageDispatch(setSelectedMessages(selectedMessages));
    messageDispatch(setLastMessageId(selectedMessageId));
    messageDispatch(setCurrentMessageId(currentMessageId));
  };

  const handleNewChat = () => {
    postChats({ title: t('New Conversation') }).then((data) => {
      // const model = calcSelectModel(chats, models);
      chatDispatch(setChats([data, ...chats]));
      chatDispatch(setSelectedChat(data));
      chatDispatch(setChatStatus(false));

      messageDispatch(setMessages([]));
      messageDispatch(setLastMessageId(''));
      messageDispatch(setSelectedMessages([]));
      messageDispatch(setCurrentMessages([]));
      // handleSelectModel(model!);
      router.push('#/' + data.id);
    });
  };

  const clearUserModelConfig = () => {
    userModelConfigDispatch(
      setUserModelConfig({
        prompt: null,
        temperature: null,
        enableSearch: null,
      }),
    );
  };

  const handleSelectChat = (chat: IChat) => {
    chatDispatch(setChatStatus(false));
    chatDispatch(setSelectedChat(chat));
    // const selectModel =
    //   getChatModel(chats, chat.id, models) || calcSelectModel(chats, models);
    // selectModel && setStorageModelId(selectModel.modelId);
    getUserMessages(chat.id).then((data) => {
      if (data.length > 0) {
        messageDispatch(setMessages(data));
        const messages = formatMessages(data);
        messageDispatch(setCurrentMessages(messages));
        const lastMessage = messages[messages.length - 1];
        const selectMessageList = getSelectedMessages(messages, lastMessage.id);
        if (lastMessage.role !== 'assistant') {
          chatDispatch(setChatStatus(true));
          selectMessageList.push(chatErrorMessage(lastMessage.id));
        }

        messageDispatch(setSelectedMessages(selectMessageList));
        messageDispatch(setLastMessageId(lastMessage.id));
        clearUserModelConfig();
        // modelDispatch(setSelectedModel(selectModel));
      } else {
        // handleSelectModel(selectModel!);
        messageDispatch(setSelectedMessages([]));
        messageDispatch(setCurrentMessages([]));
      }
    });
    router.push('#/' + chat.id);
    setStorageChatId(chat.id);
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
          messageDispatch(setMessages(data));
          const messages = formatMessages(data);
          messageDispatch(setCurrentMessages(messages));
          const lastMessage = messages[messages.length - 1];
          const selectMessageList = getSelectedMessages(messages, lastMessage.id);
          if (lastMessage.role !== 'assistant') {
            chatDispatch(setChatStatus(true));
            selectMessageList.push(chatErrorMessage(lastMessage.id));
          }
          messageDispatch(setSelectedMessages(selectMessageList));
          messageDispatch(setLastMessageId(lastMessage.id));
        } else {
          messageDispatch(setCurrentMessages([]));
          messageDispatch(setSelectedMessages([]));
        }
        // const model = getChatModel(chatList, chat?.id, models);
        // calcSelectModel(chatList, models);
        // handleSelectModel(model!);
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
    messageDispatch(setSelectedMessages([]));
    messageDispatch(setCurrentMessages([]));

    // modelDispatch(setSelectedModel(calcSelectModel(chats, models)));
    clearUserModelConfig();
  };

  const handleStopChats = () => {
    let p = [] as any[];
    stopIds.forEach((id) => {
      p.push(stopChat(id));
    });
    Promise.all(p).then(() => {
      chatDispatch(setChatStatus(false));
      chatDispatch(setStopIds([]));
    });
  };

  const getChats = async (
    params: GetChatsParams,
    modelList?: AdminModelDto[],
  ) => {
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
        const selectChatId =
          getPathChatId(router.asPath) || getStorageChatId() || rows[0].id;
        selectChat(rows, selectChatId, modelList || models);
      }
    });
  };

  useEffect(() => {
    setIsPageLoading(true);
    const { showChatBar, showPromptBar } = getSettings();
    settingDispatch(setShowChatBar(showChatBar));
    settingDispatch(setShowPromptBar(showPromptBar));
  }, []);

  useEffect(() => {
    chatDispatch(setIsChatsLoading(true));
    getUserModels().then(async (modelList) => {
      modelDispatch(setModels(modelList));
      if (modelList && modelList.length > 0) {
        const selectModelId = getStorageModelId();
        const model =
          modelList.find((x) => x.modelId.toString() === selectModelId) ??
          modelList[0];
        if (model) {
          setStorageModelId(model.modelId);
          handleSelectModel(model);
        }
      }

      await getChats({ page: 1, pageSize: 50 }, modelList);
      chatDispatch(setIsChatsLoading(false));
    });

    getUserPromptBrief().then((data) => {
      promptDispatch(setPrompts(data));
    });
    setTimeout(() => setIsPageLoading(false), 500);
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
        state: {
          ...contextValue.state,
          ...chatState,
          ...messageState,
          ...modelState,
          ...userModelConfigState,
          ...settingState,
          ...promptState,
        },
        chatDispatch: chatDispatch,
        messageDispatch: messageDispatch,
        modelDispatch: modelDispatch,
        userModelConfigDispatch: userModelConfigDispatch,
        settingDispatch: settingDispatch,
        promptDispatch: promptDispatch,

        handleNewChat,
        handleStartChat,
        handleChatIsError,
        handleUpdateChats,
        handleStopChats,

        handleCreateNewChat,
        handleSelectChat,
        handleUpdateChat,
        handleDeleteChat,
        handleSelectModel,
        hasModel,
        getChats,
      }}
    >
      {isPageLoading && (
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
      {!isPageLoading && (
        <div className={'flex h-screen w-screen flex-col text-sm'}>
          <div className="flex h-full w-full bg-background">
            <Chatbar />
            <div className="flex w-full">
              <Chat />
            </div>
            {showPromptBar && <PromptBar />}
          </div>
        </div>
      )}
    </HomeContext.Provider>
  );
};

export default HomeContent;
