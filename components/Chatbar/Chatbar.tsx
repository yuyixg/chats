import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useCreateReducer } from '@/hooks/useCreateReducer';
import { removeSelectChatId, saveSelectChatId } from '@/utils/conversation';
import Sidebar from '../Sidebar';
import ChatbarContext from './Chatbar.context';
import { ChatbarInitialState, initialState } from './Chatbar.state';
import { Conversations } from './Conversations';
import { ChatBarSettings } from './ChatbarSettings';
import { HomeContext } from '@/pages/home/home';
import { ChatResult } from '@/apis/userService';

export const Chatbar = () => {
  const { t } = useTranslation('chat');

  const chatBarContextValue = useCreateReducer<ChatbarInitialState>({
    initialState,
  });

  const {
    state: { chats, showChatbar },
    dispatch: homeDispatch,
    handleDeleteChat: homeHandleDeleteChat,
    handleNewChat,
    handleUpdateConversation,
    hasModel,
  } = useContext(HomeContext);

  const {
    state: { searchTerm, filteredChats },
    dispatch: chatDispatch,
  } = chatBarContextValue;

  const handleDeleteChat = (chatId: string) => {
    const _chats = chats.filter((x) => x.id !== chatId);
    chatDispatch({ field: 'searchTerm', value: '' });
    homeHandleDeleteChat(chatId);
    if (_chats.length > 0) {
      const chatId = _chats[_chats.length - 1].id;
      homeDispatch({
        field: 'selectChatId',
        value: chatId,
      });
      saveSelectChatId(chatId);
    } else {
      removeSelectChatId();
    }
  };

  const handleToggleChatbar = () => {
    homeDispatch({ field: 'showChatbar', value: !showChatbar });
    localStorage.setItem('showChatbar', JSON.stringify(!showChatbar));
  };

  const handleDrop = (e: any) => {
    if (e.dataTransfer) {
      const conversation = JSON.parse(e.dataTransfer.getData('conversation'));
      handleUpdateConversation(conversation, [
        { key: 'folderId', value: 0 },
      ] as any);
      chatDispatch({ field: 'searchTerm', value: '' });
      e.target.style.background = 'none';
    }
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
        side={'left'}
        isOpen={showChatbar}
        addItemButtonTitle={t('New chat')}
        hasModel={hasModel}
        itemComponent={<Conversations chats={filteredChats} />}
        items={filteredChats}
        searchTerm={searchTerm}
        handleSearchTerm={(searchTerm: string) =>
          chatDispatch({ field: 'searchTerm', value: searchTerm })
        }
        toggleOpen={handleToggleChatbar}
        handleCreateItem={handleNewChat}
        handleDrop={handleDrop}
        footerComponent={<ChatBarSettings />}
      />
    </ChatbarContext.Provider>
  );
};
