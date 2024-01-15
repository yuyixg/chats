import { useCreateReducer } from '@/hooks/useCreateReducer';
import HomeContext from './home.context';
import { HomeInitialState, initialState } from './home.state';
import { Conversation } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';
import { ModelIds, ModelMaps } from '@/types/model';
import { DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPERATURE } from '@/utils/app/const';
import {
  cleanConversationHistory,
  saveConversation,
  saveConversations,
  updateConversation,
} from '@/utils/app/conversation';
import { KeyValuePair } from '@/types/data';
import { useEffect, useRef } from 'react';
import Head from 'next/head';
import { Navbar } from '@/components/Navbar/Navbar';
import { Chatbar } from '@/components/Chatbar/Chatbar';
import { Chat } from '@/components/Chat/Chat';
import { useQuery } from 'react-query';
import useApiService from '@/services/useApiService';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';

interface Props {
  serverSideApiKeyIsSet: boolean;
  serverSidePluginKeysSet: boolean;
  defaultModelId: ModelIds;
}

const Home = ({ defaultModelId }: Props) => {
  const { t } = useTranslation('sidebar');
  const contextValue = useCreateReducer<HomeInitialState>({
    initialState,
  });

  const {
    state: {
      conversations,
      selectedConversation,
      lightMode,
      models,
      prompts,
      temperature,
    },
    dispatch,
  } = contextValue;
  const { getModels } = useApiService();
  const stopConversationRef = useRef<boolean>(false);

  const handleNewConversation = () => {
    const lastConversation = conversations[conversations.length - 1];
    const _defaultModelId = defaultModelId ?? models[0].id;
    const newConversation: Conversation = {
      id: uuidv4(),
      name: t('New Conversation'),
      messages: [],
      model: lastConversation?.model || ModelMaps[_defaultModelId],
      prompt: DEFAULT_SYSTEM_PROMPT,
      temperature: lastConversation?.temperature ?? DEFAULT_TEMPERATURE,
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
    return models.length > 0;
  };

  useEffect(() => {
    const conversationHistory = localStorage.getItem('conversationHistory');
    if (conversationHistory) {
      const parsedConversationHistory: Conversation[] =
        JSON.parse(conversationHistory);
      const cleanedConversationHistory = cleanConversationHistory(
        parsedConversationHistory
      );

      dispatch({ field: 'conversations', value: cleanedConversationHistory });
    }
    const selectedConversation = localStorage.getItem('selectedConversation');
    if (selectedConversation) {
      const parsedSelectedConversation: Conversation =
        JSON.parse(selectedConversation);

      dispatch({
        field: 'selectedConversation',
        value: parsedSelectedConversation,
      });
    } else {
      const lastConversation = conversations[conversations.length - 1];
      const _defaultModelId = defaultModelId ? defaultModelId : models[0]?.id;
      dispatch({
        field: 'selectedConversation',
        value: {
          id: uuidv4(),
          name: t('New Conversation'),
          messages: [],
          model: lastConversation?.model || ModelMaps[_defaultModelId],
          prompt: DEFAULT_SYSTEM_PROMPT,
          temperature: lastConversation?.temperature ?? DEFAULT_TEMPERATURE,
        },
      });
    }
  }, [defaultModelId, models, dispatch]);

  const { data } = useQuery(
    ['GetModels'],
    ({ signal }) => {
      return getModels({}, signal);
    },
    { enabled: true, refetchOnMount: false }
  );

  useEffect(() => {
    dispatch({
      field: 'modelsLoading',
      value: true,
    });
    if (data && data.length > 0) {
      dispatch({
        field: 'defaultModelId',
        value: data[0].id,
      });
      dispatch({ field: 'models', value: data });
    }
    dispatch({
      field: 'modelsLoading',
      value: false,
    });
  }, [data, dispatch]);

  return (
    <HomeContext.Provider
      value={{
        ...contextValue,
        handleNewConversation,
        handleSelectConversation,
        handleUpdateConversation,
        hasModel,
      }}
    >
      <Head>
        <title>Chats</title>
        <meta name='description' content='ChatGPT but better.' />
        <meta
          name='viewport'
          content='height=device-height ,width=device-width, initial-scale=1, user-scalable=no'
        />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      {selectedConversation && (
        <main
          className={`flex h-screen w-screen flex-col text-sm text-white dark:text-white ${lightMode}`}
        >
          <div className='fixed top-0 w-full sm:hidden'>
            <Navbar
              selectedConversation={selectedConversation}
              onNewConversation={handleNewConversation}
              hasModel={hasModel}
            />
          </div>

          <div className='flex h-full w-full pt-[48px] sm:pt-0'>
            <Chatbar />
            <div className='flex flex-1'>
              <Chat stopConversationRef={stopConversationRef} />
            </div>
          </div>
        </main>
      )}
    </HomeContext.Provider>
  );
};

export default Home;

export const getServerSideProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      defaultModelId: null,
      ...(await serverSideTranslations(locale ?? 'en', [
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
