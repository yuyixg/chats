import { useContext } from 'react';

import { chatsGroupByUpdatedAt } from '@/utils/chats';
import { currentISODateString } from '@/utils/date';

import { IChat } from '@/types/chat';
import { IChatGroup } from '@/types/group';

import Folder from '@/components/Folder/Folder';

import { setChatGroup, setChats } from '../../_actions/chat.actions';
import HomeContext from '../../_contexts/home.context';
import Conversations from './Conversations';

import { deleteChatGroup, putChatGroup, putChats } from '@/apis/clientApis';

interface Props {}

export const ChatGroups = ({}: Props) => {
  const {
    state: { chats, chatGroups },
    chatDispatch,
  } = useContext(HomeContext);

  const handleDrop = (e: any, folder: IChatGroup) => {
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

  const handleClickGroup = (folder: IChatGroup) => {
    if (folder.id) {
      putChatGroup({ id: folder.id, isExpanded: !folder.isExpanded });
    }
  };

  const handleDeleteGroup = (groupId: string) => {
    deleteChatGroup(groupId).then(() => {
      const chatList = chats.map((x) => {
        if (x.groupId === groupId) {
          x.groupId = null;
        }
        return x;
      });
      const chatFolderList = chatGroups.filter((x) => x.id !== groupId);
      chatDispatch(setChats(chatList));
      chatDispatch(setChatGroup(chatFolderList));
    });
  };

  const handRenameGroup = (groupId: string, value: string) => {
    putChatGroup({ id: groupId, name: value }).then(() => {
      const chatFolderList = chatGroups.map((x) => {
        if (x.id === groupId) {
          x.name = value;
        }
        return x;
      });
      chatDispatch(setChatGroup(chatFolderList));
    });
  };

  const ChatGroupsRender = (chatFolder: IChatGroup) => {
    const chatList = chats.filter((x) => x.groupId === chatFolder.id);
    const groupByUpdatedChats = chatsGroupByUpdatedAt(chatList);
    return <Conversations chatGroups={groupByUpdatedChats} />;
  };

  return (
    <div className="flex w-full flex-col pt-2">
      {chatGroups.map((group, index) => (
        <Folder
          key={index}
          showActions={!!group.id}
          defaultOpen={group.isExpanded}
          currentFolder={group}
          onDrop={handleDrop}
          onClickGroup={handleClickGroup}
          onDeleteGroup={handleDeleteGroup}
          onRenameGroup={handRenameGroup}
          folderComponent={ChatGroupsRender(group)}
        />
      ))}
    </div>
  );
};
