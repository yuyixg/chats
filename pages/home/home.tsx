import { useCreateReducer } from '@/hooks/useCreateReducer';
import { Conversation } from '@/types/chat';
import { ModelVersions } from '@/types/model';
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
import { ChatMessage } from '@/types/chatMessage';
interface HandleUpdateChatParams {
  title?: string;
}

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
  selectModelId: string | undefined;
  currentMessages: ChatMessage[];
  selectMessages: ChatMessage[];
  selectMessageLastId: string;
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
  currentMessages: [],
  selectMessages: [],
  selectMessageLastId: '',
  models: [],
  chats: [],
  selectModelId: undefined,
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
  handleUpdateChat: (id: string, params: HandleUpdateChatParams) => void;
  handleUpdateSelectMessage: (lastLeafId: string) => void;
  handleDeleteChat: (id: string) => void;
  handleSelectModel: (modelId: string) => void;
  hasModel: () => boolean;
  getModel: () => Model;
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
    state: {
      selectModelId,
      chats,
      currentMessages,
      selectedConversation,
      models,
      user,
      messageIsStreaming,
    },
    dispatch,
  } = contextValue;
  const stopConversationRef = useRef<boolean>(false);
  const { setTheme } = useTheme();

  const getLastChat = () => {
    if (chats.length === 0) return null;
    const chatLength = chats.length - 1;
    return chats[chatLength];
  };

  const calcSelectModelId = () => {
    const lastChat = getLastChat();
    if (lastChat && lastChat.chatModelId) return lastChat.chatModelId;
    else return models.length > 0 ? models[0].id : undefined;
  };

  const getChatModelId = (chatId: string) => {
    return chats.find((x) => x.id === chatId)?.chatModelId;
  };

  const handleNewChat = () => {
    postChats({ title: t('New Conversation') }).then((data) => {
      dispatch({ field: 'selectChatId', value: data.id });
      dispatch({ field: 'selectMessageLastId', value: '' });
      dispatch({ field: 'currentMessages', value: [] });
      dispatch({ field: 'selectMessages', value: [] });
      dispatch({ field: 'selectModelId', value: calcSelectModelId() });
      dispatch({ field: 'chats', value: [...chats, data] });
    });
  };

  function findMessageChildren(
    conversations: ChatMessage[],
    nodeId: string,
    messages: ChatMessage[]
  ) {
    const message = conversations.findLast((x) => x.parentId === nodeId);
    if (message) {
      messages.push(message);
      return findMessageChildren(conversations, message.id, messages);
    }
    return messages;
  }

  function findMessageParent(
    conversations: ChatMessage[],
    nodeId: string | null,
    messages: ChatMessage[]
  ) {
    if (!nodeId) return messages;
    const message = conversations.find((x) => x.id === nodeId);
    if (message) {
      messages.push(message);
      return findMessageParent(conversations, message.parentId, messages);
    }
    return messages.reverse();
  }

  function getSelectMessages(
    conversations: ChatMessage[],
    nodeId: string
  ): ChatMessage[] {
    let selectMessages: ChatMessage[] = [];
    const message = conversations.find((node) => node.id === nodeId);
    if (!message) {
      return [];
    }
    const messageChildren = findMessageChildren(conversations, message.id, []);
    if (!message.parentId) {
      selectMessages.push(message);
    } else {
      const messageParent = findMessageParent(
        conversations,
        message.parentId,
        []
      );
      messageParent.reverse();
      selectMessages = selectMessages.concat([...messageParent, message]);
    }
    selectMessages = selectMessages.concat(messageChildren);
    return selectMessages;
  }

  const handleSelectChat = (chatId: string) => {
    dispatch({ field: 'selectChatId', value: chatId });
    dispatch({
      field: 'selectModelId',
      value: getChatModelId(chatId) || calcSelectModelId(),
    });
    getUserMessages(chatId).then((data) => {
      if (data.length > 0) {
        dispatch({ field: 'currentMessages', value: data });
        const lastMessage = data[data.length - 1];
        const _selectMessages = getSelectMessages(data, lastMessage.id);
        dispatch({
          field: 'selectMessages',
          value: _selectMessages,
        });
      }
    });
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
  };

  const handleUpdateChat = (id: string, params: HandleUpdateChatParams) => {
    const chat = chats.map((x) => {
      if (x.id === id) return { ...x, ...params };
      return x;
    });
    dispatch({ field: 'chats', value: chat });
  };

  const handleDeleteChat = (id: string) => {
    const _chats = chats.filter((x) => {
      return x.id !== id;
    });
    dispatch({ field: 'chats', value: _chats });
    dispatch({ field: 'selectChatId', value: '' });
    dispatch({ field: 'selectMessageLastId', value: '' });
    dispatch({ field: 'currentMessages', value: [] });
    dispatch({ field: 'selectMessages', value: [] });
    dispatch({ field: 'selectModelId', value: calcSelectModelId() });
  };

  const hasModel = () => {
    return models?.length > 0;
  };

  const getModel = () => {
    return models.find((x) => x.id === selectModelId)!;
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
      getChats().then((data) => {
        dispatch({ field: 'chats', value: data });
      });
  }, [messageIsStreaming]);

  useEffect(() => {
    dispatch({
      field: 'modelsLoading',
      value: true,
    });

    getUserModels().then((data) => {
      if (data && data.length > 0) {
        dispatch({
          field: 'selectModelId',
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
        handleUpdateChat,
        handleDeleteChat,
        handleSelectModel,
        handleUpdateSelectMessage,
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
                onNewConversation={handleNewChat}
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
