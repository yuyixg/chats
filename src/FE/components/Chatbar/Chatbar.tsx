import { useContext, useEffect } from 'react';

import useTranslation from '@/hooks/useTranslation';

import { useCreateReducer } from '@/hooks/useCreateReducer';

import { removeSelectChatId, saveSelectChatId } from '@/utils/chats';

import { HomeContext } from '@/pages/home/home';

import Sidebar from '@/components/Sidebar';

import ChatbarContext from './Chatbar.context';
import { ChatbarInitialState, initialState } from './Chatbar.state';
import { ChatBarSettings } from './ChatbarSettings';
import { Conversations } from './Conversations';

import { ChatResult } from '@/apis/clientApis';

export const Chatbar = () => {
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
      saveSelectChatId(chat.id);
    } else {
      handleSelectModel(selectModel!);
      removeSelectChatId();
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
