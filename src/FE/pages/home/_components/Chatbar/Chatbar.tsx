import { useContext, useEffect } from 'react';

import { useCreateReducer } from '@/hooks/useCreateReducer';
import useTranslation from '@/hooks/useTranslation';

import { removeStorageChatId, setStorageChatId } from '@/utils/chats';

import { ChatResult } from '@/types/clientApis';

import HomeContext from '../../_contexts/home.context';
import Sidebar from '../Sidebar/Sidebar';
import ChatbarContext from './Chatbar.context';
import { ChatbarInitialState, initialState } from './Chatbar.context';
import ChatBarSettings from './ChatbarSettings';
import Conversations from './Conversations';

const Chatbar = () => {
  const { t } = useTranslation();

  const chatBarContextValue = useCreateReducer<ChatbarInitialState>({
    initialState,
  });

  const {
    state: { chats, selectModel, settings, messageIsStreaming },
    handleDeleteChat: homeHandleDeleteChat,
    handleUpdateSettings,
    handleSelectChat,
    handleSelectModel,
    handleNewChat,
    hasModel,
    getChats,
  } = useContext(HomeContext);

  const {
    state: { searchTerm, filteredChats },
    dispatch: chatDispatch,
  } = chatBarContextValue;

  const handleDeleteChat = (chatId: string) => {
    const chatList = chats.filter((x) => x.id !== chatId);
    chatDispatch({ field: 'searchTerm', value: '' });
    homeHandleDeleteChat(chatId);
    if (chatList.length > 0) {
      const chat = chatList[chatList.length - 1];
      handleSelectChat(chat);
      setStorageChatId(chat.id);
    } else {
      handleSelectModel(selectModel!);
      removeStorageChatId();
    }
  };

  const handleToggleChatbar = () => {
    const showChatBar = !settings.showChatBar;
    handleUpdateSettings('showChatBar', showChatBar);
  };

  useEffect(() => {
    if (searchTerm) {
      chatDispatch({
        field: 'filteredChats',
        value: chats.filter((chat) => {
          const searchable = chat.title.toLocaleLowerCase();
          return searchable.toLowerCase().includes(searchTerm.toLowerCase());
        }),
      });
    } else {
      chatDispatch({
        field: 'filteredChats',
        value: chats,
      });
    }
  }, [searchTerm, chats]);

  return (
    <ChatbarContext.Provider
      value={{
        ...chatBarContextValue,
        handleDeleteChat,
      }}
    >
      <Sidebar<ChatResult>
        messageIsStreaming={messageIsStreaming}
        side={'left'}
        isOpen={settings.showChatBar}
        addItemButtonTitle={t('New chat')}
        hasModel={hasModel}
        itemComponent={<Conversations chats={filteredChats} />}
        items={filteredChats}
        searchTerm={searchTerm}
        handleSearchTerm={(searchTerm: string) => {
          chatDispatch({ field: 'searchTerm', value: searchTerm });
          getChats({ query: searchTerm, page: 1, pageSize: 50 }, []);
        }}
        toggleOpen={handleToggleChatbar}
        handleCreateItem={handleNewChat}
        footerComponent={<ChatBarSettings />}
      />
    </ChatbarContext.Provider>
  );
};
export default Chatbar;
