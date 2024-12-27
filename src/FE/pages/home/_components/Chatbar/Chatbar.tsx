import { useContext, useEffect, useState } from 'react';

import { useCreateReducer } from '@/hooks/useCreateReducer';
import useTranslation from '@/hooks/useTranslation';

import { ChatResult } from '@/types/clientApis';

import { setShowChatBar } from '../../_actions/setting.actions';
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
    state: { chats, showChatBar, messageIsStreaming, isChatsLoading },
    settingDispatch,
    handleDeleteChat: homeHandleDeleteChat,
    handleNewChat,
    hasModel,
    getChats,
  } = useContext(HomeContext);

  const {
    state: { filteredChats },
    dispatch,
  } = chatBarContextValue;
  const [searchTerm, setSearchTerm] = useState('');
  const handleDeleteChat = (chatId: string) => {
    homeHandleDeleteChat(chatId);
  };

  const handleToggleChatbar = () => {
    settingDispatch(setShowChatBar(!showChatBar));
  };

  useEffect(() => {
    if (searchTerm) {
      dispatch({
        field: 'filteredChats',
        value: chats.filter((chat) => {
          const searchable = chat.title.toLocaleLowerCase();
          return searchable.toLowerCase().includes(searchTerm.toLowerCase());
        }),
      });
    } else {
      dispatch({
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
        isLoading={isChatsLoading}
        messageIsStreaming={messageIsStreaming}
        side={'left'}
        isOpen={showChatBar}
        addItemButtonTitle={t('New chat')}
        hasModel={hasModel}
        itemComponent={<Conversations chats={filteredChats} />}
        items={filteredChats}
        searchTerm={searchTerm}
        handleSearchTerm={(value: string) => {
          setSearchTerm(value);
          getChats({ query: value, page: 1, pageSize: 50 });
        }}
        toggleOpen={handleToggleChatbar}
        handleCreateItem={handleNewChat}
        footerComponent={<ChatBarSettings />}
      />
    </ChatbarContext.Provider>
  );
};
export default Chatbar;
