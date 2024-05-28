import { useCreateReducer } from '@/hooks/useCreateReducer';
import { useEffect, useRef } from 'react';
import Head from 'next/head';
import { Chatbar } from '@/components/Chatbar/Chatbar';
import { Chat } from '@/components/Chat/Chat';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { getSettingsLanguage, getSettings } from '@/utils/settings';
import { getSession } from '@/utils/session';
import { getLoginUrl, getUserInfo, getUserSessionId } from '@/utils/user';
import { useRouter } from 'next/router';
import { Dispatch, createContext } from 'react';
import { ActionType } from '@/hooks/useCreateReducer';
import { v4 as uuidv4 } from 'uuid';
import { Model } from '@/types/model';
import { Prompt } from '@/types/prompt';
import { UserSession } from '@/utils/user';
import {
  ChatResult,
  getChats,
  getUserMessages,
  getUserModels,
  getUserPrompts,
  postChats,
} from '@/apis/userService';
import {
  DEFAULT_LANGUAGE,
  DEFAULT_THEME,
  Languages,
  Themes,
} from '@/types/settings';
import { useTheme } from 'next-themes';
import Spinner from '@/components/Spinner';
import { ChatMessage } from '@/types/chatMessage';
import { getSelectMessages } from '@/utils/message';
import PromptBar from '@/components/Promptbar';
import {
  getPathChatId,
  getSelectChatId,
  saveSelectChatId,
} from '@/utils/chats';
import { Role } from '@/types/chat';
import { getStorageModelId, setStorageModelId } from '@/utils/model';
interface HandleUpdateChatParams {
  title?: string;
  chatModelId?: string;
}

interface HomeInitialState {
  user: UserSession | null;
  loading: boolean;
  theme: (typeof Themes)[number];
  language: (typeof Languages)[number];
  messageIsStreaming: boolean;
  models: Model[];
  chats: ChatResult[];
  selectChatId: string | undefined;
  selectModelId: string | undefined;
  currentMessages: ChatMessage[];
  selectMessages: ChatMessage[];
  selectMessageLastId: string;
  currentChatMessageId: string;
  userModelConfig: Object;
  chatError: boolean;
  prompts: Prompt[];
  showChatbar: boolean;
  showPromptbar: boolean;
  searchTerm: string;
  canChat: boolean;
}

const initialState: HomeInitialState = {
  user: null,
  loading: false,
  theme: DEFAULT_THEME,
  language: DEFAULT_LANGUAGE,
  messageIsStreaming: false,
  currentMessages: [],
  userModelConfig: {},
  selectMessages: [],
  selectMessageLastId: '',
  currentChatMessageId: '',
  models: [],
  chats: [],
  selectModelId: undefined,
  selectChatId: undefined,
  chatError: false,
  prompts: [],
  showPromptbar: false,
  showChatbar: true,
  searchTerm: '',
  canChat: false,
};

interface HomeContextProps {
  state: HomeInitialState;
  dispatch: Dispatch<ActionType<HomeInitialState>>;
  handleNewChat: () => void;
  handleSelectChat: (chatId: string) => void;
  handleUpdateChat: (
    chats: ChatResult[],
    id: string,
    params: HandleUpdateChatParams
  ) => void;
  handleUpdateSelectMessage: (lastLeafId: string) => void;
  handleUpdateCurrentMessage: (chatId: string) => void;
  handleDeleteChat: (id: string) => void;
  handleSelectModel: (modelId: string) => void;
  handleUpdateUserModelConfig: (value: any) => void;
  hasModel: () => boolean;
  getModel: (models: Model[], selectModelId: string) => Model;
}

const HomeContext = createContext<HomeContextProps>(undefined!);

export { initialState, HomeContext };

const Home = () => {
  const router = useRouter();
  const { t } = useTranslation('chat');
  const contextValue = useCreateReducer<HomeInitialState>({
    initialState,
  });

  const {
    state: { chats, currentMessages, models, user, userModelConfig },
    dispatch,
  } = contextValue;
  const stopConversationRef = useRef<boolean>(false);
  const { setTheme } = useTheme();

  const calcSelectModelId = (chats: ChatResult[], models: Model[]) => {
    const lastChat = chats.findLast((x) => x.chatModelId);
    const model = models.find((x) => x.id === lastChat?.chatModelId);
    if (lastChat && lastChat.chatModelId && model) return lastChat.chatModelId;
    else return models.length > 0 ? models[0].id : undefined;
  };

  const getChatModelId = (chatId: string) => {
    return chats.find((x) => x.id === chatId)?.chatModelId;
  };

  const chatErrorMessage = (message: ChatMessage) => {
    return {
      id: uuidv4(),
      parentId: message.id,
      childrenIds: [],
      assistantChildrenIds: [],
      role: 'assistant' as Role,
      content: { text: '', image: [] },
    };
  };

  const handleNewChat = () => {
    postChats({ title: t('New Conversation') }).then((data) => {
      dispatch({ field: 'selectChatId', value: data.id });
      dispatch({ field: 'selectMessageLastId', value: '' });
      dispatch({ field: 'currentMessages', value: [] });
      dispatch({ field: 'selectMessages', value: [] });
      dispatch({ field: 'chatError', value: false });
      dispatch({
        field: 'selectModelId',
        value: calcSelectModelId(chats, models),
      });
      dispatch({ field: 'chats', value: [...chats, data] });
      dispatch({ field: 'userModelConfig', value: {} });
      router.push('#/' + data.id);
    });
  };

  const handleUpdateCurrentMessage = (chatId: string) => {
    getUserMessages(chatId).then((data) => {
      if (data.length > 0) {
        dispatch({ field: 'currentMessages', value: data });
        const lastMessage = data[data.length - 1];
        const _selectMessages = getSelectMessages(data, lastMessage.id);
        dispatch({
          field: 'selectMessages',
          value: _selectMessages,
        });
        dispatch({ field: 'selectMessageLastId', value: lastMessage.id });
      } else {
        dispatch({ field: 'currentMessages', value: [] });
        dispatch({
          field: 'selectMessages',
          value: [],
        });
      }
    });
  };

  const handleSelectChat = (chatId: string) => {
    dispatch({
      field: 'chatError',
      value: false,
    });
    dispatch({ field: 'selectChatId', value: chatId });
    const chat = chats.find((x) => x.id === chatId)!;
    dispatch({ field: 'userModelConfig', value: chat.userModelConfig });
    getUserMessages(chatId).then((data) => {
      if (data.length > 0) {
        dispatch({ field: 'currentMessages', value: data });
        const lastMessage = data[data.length - 1];
        const _selectMessages = getSelectMessages(data, lastMessage.id);
        if (lastMessage.role !== 'assistant') {
          dispatch({
            field: 'chatError',
            value: true,
          });
          _selectMessages.push(chatErrorMessage(lastMessage));
        }

        dispatch({
          field: 'selectMessages',
          value: _selectMessages,
        });
        dispatch({ field: 'selectMessageLastId', value: lastMessage.id });
      } else {
        dispatch({ field: 'currentMessages', value: [] });
        dispatch({
          field: 'selectMessages',
          value: [],
        });
      }
      dispatch({
        field: 'canChat',
        value:
          (hasModel() && data.length === 0) ||
          models.find((x) => x.id === chat?.chatModelId),
      });
      const selectModelId =
        getChatModelId(chatId) || calcSelectModelId(chats, models);
      selectModelId && setStorageModelId(selectModelId);
      dispatch({
        field: 'selectModelId',
        value: selectModelId,
      });
    });
    router.push('#/' + chat.id);
    saveSelectChatId(chatId);
  };

  const handleUpdateSelectMessage = (messageId: string) => {
    const _selectMessages = getSelectMessages(currentMessages, messageId);
    dispatch({
      field: 'selectMessages',
      value: _selectMessages,
    });
  };

  const handleSelectModel = (modelId: string) => {
    dispatch({ field: 'selectModelId', value: modelId });
    dispatch({ field: 'userModelConfig', value: {} });
  };

  function handleUpdateChat(
    chats: ChatResult[],
    id: string,
    params: HandleUpdateChatParams
  ) {
    const _chats = chats.map((x) => {
      if (x.id === id) return { ...x, ...params };
      return x;
    });

    dispatch({ field: 'chats', value: _chats });
  }

  const handleDeleteChat = (id: string) => {
    const _chats = chats.filter((x) => {
      return x.id !== id;
    });
    dispatch({ field: 'chats', value: _chats });
    dispatch({ field: 'selectChatId', value: '' });
    dispatch({ field: 'selectMessageLastId', value: '' });
    dispatch({ field: 'currentMessages', value: [] });
    dispatch({ field: 'selectMessages', value: [] });
    dispatch({
      field: 'selectModelId',
      value: calcSelectModelId(chats, models),
    });
    dispatch({ field: 'userModelConfig', value: {} });
  };

  const handleUpdateUserModelConfig = (value: any) => {
    dispatch({
      field: 'userModelConfig',
      value: { ...userModelConfig, ...value },
    });
  };

  const hasModel = () => {
    return models?.length > 0;
  };

  const getModel = (models: Model[], selectModelId: string) => {
    return models.find((x) => x.id === selectModelId)!;
  };

  const selectChat = (
    chatList: ChatResult[],
    chatId: string | null,
    models: Model[]
  ) => {
    const chat = chatList.find((x) => x.id === chatId);
    if (chat) {
      dispatch({ field: 'selectChatId', value: chatId });
      dispatch({
        field: 'userModelConfig',
        value: chat?.userModelConfig || {},
      });
      getUserMessages(chat.id).then((data) => {
        if (data.length > 0) {
          dispatch({ field: 'currentMessages', value: data });
          const lastMessage = data[data.length - 1];
          const _selectMessages = getSelectMessages(data, lastMessage.id);
          if (lastMessage.role !== 'assistant') {
            dispatch({
              field: 'chatError',
              value: true,
            });
            _selectMessages.push(chatErrorMessage(lastMessage));
          }
          dispatch({
            field: 'selectMessages',
            value: _selectMessages,
          });
          dispatch({ field: 'selectMessageLastId', value: lastMessage.id });
        } else {
          dispatch({ field: 'currentMessages', value: [] });
          dispatch({
            field: 'selectMessages',
            value: [],
          });
        }
        const hasModel = models.length > 0;
        dispatch({
          field: 'canChat',
          value:
            (hasModel && data.length === 0) ||
            models.find((x) => x.id === chat?.chatModelId),
        });
        const modelId =
          chat?.chatModelId || calcSelectModelId(chatList, models);
        dispatch({
          field: 'selectModelId',
          value: modelId,
        });
      });
    }
  };

  useEffect(() => {
    const settings = getSettings();
    if (settings.theme) {
      dispatch({
        field: 'theme',
        value: settings.theme,
      });
      setTheme(settings.theme);
    }

    if (settings.language) {
      dispatch({
        field: 'language',
        value: settings.language,
      });
    }

    const showChatbar = localStorage.getItem('showChatbar');
    if (showChatbar) {
      dispatch({ field: 'showChatbar', value: showChatbar === 'true' });
    }

    const showPromptbar = localStorage.getItem('showPromptbar');
    if (showPromptbar) {
      dispatch({ field: 'showPromptbar', value: showPromptbar === 'true' });
    }
  }, []);

  useEffect(() => {
    const session = getUserInfo();
    const sessionId = getUserSessionId();
    if (session && sessionId) {
      setTimeout(() => {
        dispatch({ field: 'user', value: session });
      }, 1000);
    } else {
      router.push(getLoginUrl(getSettingsLanguage()));
    }
    if (sessionId) {
      getUserModels().then((modelData) => {
        dispatch({ field: 'models', value: modelData });
        if (modelData && modelData.length > 0) {
          const selectModelId = getStorageModelId();
          const model = modelData.find((x) => x.id === selectModelId);
          const modelId = model?.id || modelData[0].id;
          setStorageModelId(modelId);
          dispatch({
            field: 'selectModelId',
            value: modelId,
          });
        }

        getChats().then((data) => {
          dispatch({ field: 'chats', value: data });
          const selectChatId =
            getPathChatId(router.asPath) || getSelectChatId();
          selectChat(data, selectChatId, modelData);
        });
      });

      getUserPrompts().then((data) => {
        dispatch({ field: 'prompts', value: data });
      });
    }
  }, []);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const chatId = getPathChatId(event.state.as);
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
        handleNewChat,
        handleSelectChat,
        handleUpdateChat,
        handleDeleteChat,
        handleSelectModel,
        handleUpdateSelectMessage,
        handleUpdateCurrentMessage,
        handleUpdateUserModelConfig,
        hasModel,
        getModel,
      }}
    >
      <Head>
        <title>Chats</title>
        <meta name='description' content='' />
        <meta
          name='viewport'
          content='height=device-height ,width=device-width, initial-scale=1, user-scalable=no'
        />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main>
        {!user && (
          <div
            className={`fixed top-0 left-0 bottom-0 right-0 bg-white dark:bg-[#202123] text-black/80 dark:text-white/80 z-50 text-center text-[12.5px]`}
          >
            <div className='fixed w-screen h-screen top-1/2'>
              <div className='flex justify-center'>
                <Spinner
                  size='18'
                  className='text-gray-500 dark:text-gray-50'
                />
              </div>
            </div>
          </div>
        )}
        <div className={`flex h-screen w-screen flex-col text-sm`}>
          <div className='flex h-full w-full dark:bg-[#262630]'>
            <Chatbar />
            <div className='flex w-full'>
              <Chat stopConversationRef={stopConversationRef} />
            </div>
            <PromptBar />
          </div>
        </div>
      </main>
    </HomeContext.Provider>
  );
};

export default Home;

export const getServerSideProps = async ({
  locale,
  req,
}: {
  locale: string;
  req: any;
}) => {
  const session = await getSession(req.headers.cookie);
  return {
    props: {
      locale,
      session,
      ...(await serverSideTranslations(locale ?? DEFAULT_LANGUAGE, [
        'common',
        'chat',
        'sidebar',
        'markdown',
        'prompt',
        'settings',
      ])),
    },
  };
};
