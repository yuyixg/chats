import { useContext } from 'react';

import { chatsGroupByUpdatedAt } from '@/utils/chats';
import { currentISODateString } from '@/utils/date';

import { IChat } from '@/types/chat';
import { IChatFolder } from '@/types/folder';

import Folder from '@/components/Folder/Folder';

import { setChatGroups, setChats } from '../../_actions/chat.actions';
import HomeContext from '../../_contexts/home.context';
import Conversation from './Conversation';
import Conversations from './Conversations';

import { putChats } from '@/apis/clientApis';

interface Props {
  searchTerm: string;
}

export const ChatFolders = ({ searchTerm }: Props) => {
  const {
    state: { chats, chatFolders },
    chatDispatch,
  } = useContext(HomeContext);

  const handleDrop = (e: any, folder: IChatFolder) => {
    if (e.dataTransfer) {
      const chat = JSON.parse(e.dataTransfer.getData('chat')) as IChat;
      const chatList = chats.map((c) => {
        if (c.id === chat.id) {
          return {
            ...c,
            groupId: folder.id,
            updatedAt: currentISODateString(),
          };
        }
        return c;
      });
      chatDispatch(setChats(chatList));
      putChats(chat.id, { setsGroupId: true, groupId: folder.id });
    }
  };

  const ChatFolders = (chatFolder: IChatFolder) => {
    const chatList = chats.filter((x) => x.groupId === chatFolder.id);
    const groupByUpdatedChats = chatsGroupByUpdatedAt(chatList);
    return <Conversations chatGroups={groupByUpdatedChats} />;
  };

  return (
    <div className="flex w-full flex-col pt-2">
      {chatFolders.map((folder, index) => (
        <Folder
          key={index}
          showActions={!!folder.id}
          defaultOpen={folder.isExpanded}
          searchTerm={searchTerm}
          currentFolder={folder}
          onDrop={handleDrop}
          folderComponent={ChatFolders(folder)}
        />
      ))}
    </div>
  );
};
