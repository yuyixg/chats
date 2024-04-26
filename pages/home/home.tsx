import { useCreateReducer } from '@/hooks/useCreateReducer';
import { Conversation } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';
import { ModelVersions } from '@/types/model';
import { DEFAULT_TEMPERATURE } from '@/utils/const';
import {
  saveConversation,
  saveConversations,
  updateConversation,
} from '@/utils/conversation';
import { KeyValuePair } from '@/types/data';
import { useEffect, useRef } from 'react';
import Head from 'next/head';
import { Navbar } from '@/components/Navbar/Navbar';
import { Chatbar } from '@/components/Chatbar/Chatbar';
import { Chat } from '@/components/Chat/Chat';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { getSettingsLanguage, getSettings } from '@/utils/settings';
import { getSession } from '@/utils/session';
import { Session } from '@/types/session';
import { getLoginUrl, getUserSession } from '@/utils/user';
import { useRouter } from 'next/router';
import { Dispatch, createContext } from 'react';
import { ActionType } from '@/hooks/useCreateReducer';
import { Message } from '@/types/chat';
import { ErrorMessage } from '@/types/error';
import { Model } from '@/types/model';
import { Prompt } from '@/types/prompt';
import { UserSession } from '@/utils/user';
import {
  ChatResult,
  getChats,
  getUserMessages,
  getUserModels,
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

interface Props {
  serverSideApiKeyIsSet: boolean;
  serverSidePluginKeysSet: boolean;
  defaultModelId: ModelVersions;
  session: Session;
  locale: string;
}

interface HomeInitialState {
  user: UserSession | null;
  loading: boolean;
  theme: (typeof Themes)[number];
  language: (typeof Languages)[number];
  messageIsStreaming: boolean;
  modelError: ErrorMessage | null;
  modelsLoading: boolean;
  models: Model[];
  chats: ChatResult[];
  selectChatId: string | undefined;
  conversations: Conversation[];
  selectedConversation: Conversation | undefined;
  currentMessage: Message | undefined;
  prompts: Prompt[];
  temperature: number;
  showChatbar: boolean;
  showPromptbar: boolean;
  messageError: boolean;
  searchTerm: string;
  defaultModelId: string | null;
}

const initialState: HomeInitialState = {
  user: null,
  loading: false,
  theme: DEFAULT_THEME,
  language: DEFAULT_LANGUAGE,
  messageIsStreaming: false,
  modelError: null,
  modelsLoading: false,
  models: [],
  chats: [],
  selectChatId: undefined,
  conversations: [],
  selectedConversation: undefined,
  currentMessage: undefined,
  prompts: [],
  temperature: 1,
  showPromptbar: false,
  showChatbar: true,
  messageError: false,
  searchTerm: '',
  defaultModelId: null,
};

interface HomeContextProps {
  state: HomeInitialState;
  dispatch: Dispatch<ActionType<HomeInitialState>>;
  handleNewChat: () => void;
  handleSelectChat: (chatId: string) => void;
  handleUpdateChatTitle: (id: string, title: string) => void;
  handleDeleteChat: (id: string) => void;
  handleNewConversation: () => void;
  handleSelectConversation: (conversation: Conversation) => void;
  handleUpdateConversation: (
    conversation: Conversation,
    data: KeyValuePair | KeyValuePair[]
  ) => void;
  hasModel: () => boolean;
  getModel: (modeId: string) => Model;
}

const HomeContext = createContext<HomeContextProps>(undefined!);

export { initialState, HomeContext };

const Home = ({ defaultModelId }: Props) => {
  const router = useRouter();
  const { t } = useTranslation('chat');
  const contextValue = useCreateReducer<HomeInitialState>({
    initialState,
  });

  const {
    state: {
      chats,
      conversations,
      selectedConversation,
      models,
      user,
      messageIsStreaming,
    },
    dispatch,
  } = contextValue;
  const stopConversationRef = useRef<boolean>(false);
  const { setTheme } = useTheme();

  const handleNewChat = async () => {
    const chat = await postChats({ title: t('New Conversation') });
    dispatch({ field: 'selectChatId', value: chat.id });
    dispatch({ field: 'chats', value: [...chats, chat] });
  };

  const handleSelectChat = (chatId: string) => {
    dispatch({ field: 'selectChatId', value: chatId });
  };

  const handleUpdateChatTitle = (id: string, title: string) => {
    const chat = chats.map((x) => {
      if (x.id === id) x.title = title;
      return x;
    });
    dispatch({ field: 'chats', value: chat });
  };

  const handleDeleteChat = (id: string) => {
    const _chats = chats.filter((x) => {
      return x.id !== id;
    });
    dispatch({ field: 'chats', value: _chats });
  };

  const handleNewConversation = () => {
    const lastConversation = conversations[conversations.length - 1];
    const _defaultModelId = defaultModelId ?? models[0].id;
    const model = lastConversation?.model || getModel(_defaultModelId);
    const newConversation: Conversation = {
      id: uuidv4(),
      name: t('New Conversation'),
      messages: [],
      model: model,
      prompt: t(model.systemPrompt),
      fileServerConfig: model.fileServerConfig,
      isShared: false,
      temperature: DEFAULT_TEMPERATURE,
    };

    const updatedConversations = [...conversations, newConversation];

    dispatch({ field: 'selectedConversation', value: newConversation });
    dispatch({ field: 'conversations', value: updatedConversations });

    saveConversation(newConversation);
    saveConversations(updatedConversations);

    dispatch({ field: 'loading', value: false });
  };

  const handleSelectConversation = (conversation: Conversation) => {
    dispatch({
      field: 'selectedConversation',
      value: conversation,
    });

    saveConversation(conversation);
  };

  const handleUpdateConversation = (
    conversation: Conversation,
    data: KeyValuePair | KeyValuePair[]
  ) => {
    let updatedConversation = { ...conversation };

    if (Array.isArray(data)) {
      data.forEach((pair) => {
        updatedConversation = {
          ...updatedConversation,
          [pair.key]: pair.value,
        };
      });
    } else {
      updatedConversation = {
        ...updatedConversation,
        [data.key]: data.value,
      };
    }

    const { single, all } = updateConversation(
      updatedConversation,
      conversations
    );

    dispatch({ field: 'selectedConversation', value: single });
    dispatch({ field: 'conversations', value: all });
  };

  const hasModel = () => {
    return models?.length > 0;
  };

  const getModel = (modelId: string) => {
    return models.find((x) => x.id === modelId)!;
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

    const prompts = localStorage.getItem('prompts');
    if (prompts) {
      dispatch({ field: 'prompts', value: JSON.parse(prompts) });
    }

    const showChatbar = localStorage.getItem('showChatbar');
    if (showChatbar) {
      dispatch({ field: 'showChatbar', value: showChatbar === 'true' });
    }

    const showPromptbar = localStorage.getItem('showPromptbar');
    if (showPromptbar) {
      dispatch({ field: 'showPromptbar', value: showPromptbar === 'true' });
    }

    const session = getUserSession();
    if (session) {
      setTimeout(() => {
        dispatch({ field: 'user', value: session });
      }, 1000);
    } else {
      router.push(getLoginUrl(getSettingsLanguage()));
    }
  }, []);

  useEffect(() => {
    !messageIsStreaming &&
      getUserMessages().then((data) => {
        dispatch({ field: 'conversations', value: data });
      });
  }, [messageIsStreaming]);

  useEffect(() => {
    getChats().then((data) => {
      dispatch({ field: 'chats', value: data });
    });
  }, [messageIsStreaming]);

  useEffect(() => {
    const selectedConversation = localStorage.getItem('selectedConversation');
    if (selectedConversation) {
      const parsedSelectedConversation: Conversation =
        JSON.parse(selectedConversation);

      dispatch({
        field: 'selectedConversation',
        value: parsedSelectedConversation,
      });
    } else {
      if (!models || models.length === 0) return;
      const lastConversation = conversations[conversations.length - 1];
      const _defaultModelId = defaultModelId ? defaultModelId : models[0]?.id;
      const model = lastConversation?.model || getModel(_defaultModelId);
      dispatch({
        field: 'selectedConversation',
        value: {
          id: uuidv4(),
          name: t('New Conversation'),
          messages: [],
          model: model,
          prompt: t(model.systemPrompt),
          fileServerConfig: model.fileServerConfig,
          temperature: DEFAULT_TEMPERATURE,
        },
      });
    }
  }, [defaultModelId, models, dispatch]);

  useEffect(() => {
    dispatch({
      field: 'modelsLoading',
      value: true,
    });

    getUserModels().then((data) => {
      if (data && data.length > 0) {
        localStorage.removeItem('selectedConversation');
        dispatch({
          field: 'defaultModelId',
          value: data[0].id,
        });
      }
      dispatch({ field: 'models', value: data });
      dispatch({
        field: 'modelsLoading',
        value: false,
      });
    });
  }, [dispatch]);

  return (
    <HomeContext.Provider
      value={{
        ...contextValue,
        handleNewChat,
        handleSelectChat,
        handleUpdateChatTitle,
        handleDeleteChat,

        handleNewConversation,
        handleSelectConversation,
        handleUpdateConversation,
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
          <div className='fixed top-0 w-full sm:hidden'>
            {selectedConversation && (
              <Navbar
                selectedConversation={selectedConversation}
                onNewConversation={handleNewConversation}
                hasModel={hasModel}
              />
            )}
          </div>

          <div className='flex h-full w-full pt-[48px] sm:pt-0 dark:bg-[#343541]'>
            <Chatbar />
            <div className='flex w-full'>
              <Chat stopConversationRef={stopConversationRef} />
            </div>
            {/* <Promptbar /> */}
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
      defaultModelId: null,
      ...(await serverSideTranslations(locale ?? DEFAULT_LANGUAGE, [
        'common',
        'chat',
        'sidebar',
        'markdown',
        'promptbar',
        'settings',
      ])),
    },
  };
};
