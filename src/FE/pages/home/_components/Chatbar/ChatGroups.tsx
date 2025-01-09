import { useContext, useRef } from 'react';

import { chatsGroupByUpdatedAt, isAllChatsGroup } from '@/utils/chats';
import { currentISODateString } from '@/utils/date';

import { IChat } from '@/types/chat';
import { IChatGroup } from '@/types/group';

import Folder from '@/components/Folder/Folder';

import { setChatGroup, setChats } from '../../_actions/chat.actions';
import HomeContext from '../../_contexts/home.context';
import Conversations from './Conversations';

import { deleteChatGroup, putChatGroup, putChats } from '@/apis/clientApis';
import { cn } from '@/lib/utils';

interface Props {}

export const ChatGroups = ({}: Props) => {
  const {
    state: { chats, chatGroups },
    chatDispatch,
  } = useContext(HomeContext);

  const groupRefs = useRef<any>([]);

  const handleDrop = (e: any, folder: IChatGroup) => {
    if (e.dataTransfer) {
      const chat = JSON.parse(e.dataTransfer.getData('chat')) as IChat;
      if (chat.groupId === folder.id) return;
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

  const ChatGroupsRender = (chatGroup: IChatGroup) => {
    const chatList = chats.filter((x) => x.groupId === chatGroup.id);
    const groupByUpdatedChats = chatsGroupByUpdatedAt(chatList);
    return (
      <div
        className={cn(!isAllChatsGroup(chatGroup.id) && 'ml-4 gap-2 border-l')}
      >
        <Conversations chatGroups={groupByUpdatedChats} />
      </div>
    );
  };

  const allowDrop = (e: any) => {
    e.preventDefault();
  };

  const dropHandler = (e: any, currentGroup: IChatGroup) => {
    if (e.dataTransfer) {
      handleDrop(e, currentGroup);

      groupRefs.current.forEach((x: any) => {
        x.style.background = 'none';
      });
    }
  };

  const highlightDrop = (index: number) => {
    groupRefs.current.forEach((x: any, i: number) => {
      if (index === i) {
        x.style.background = 'hsl(var(--muted))';
      } else {
        x.style.background = 'none';
      }
    });
  };

  return (
    <div className="flex w-full flex-col pt-2 bg-m">
      {chatGroups.map((group, index) => {
        const isAllChatGroup = isAllChatsGroup(group.id);
        return (
          <div
            className="rounded-md"
            ref={(el) => (groupRefs.current[index] = el)}
            onDrop={(e) => dropHandler(e, group)}
            onDragOver={allowDrop}
            onDragEnter={() => {
              highlightDrop(index);
            }}
          >
            <Folder
              key={index}
              showActions={!isAllChatGroup}
              defaultOpen={group.isExpanded}
              currentFolder={group}
              onDrop={handleDrop}
              onClickGroup={handleClickGroup}
              onDeleteGroup={handleDeleteGroup}
              onRenameGroup={handRenameGroup}
              folderComponent={ChatGroupsRender(group)}
            />
          </div>
        );
      })}
    </div>
  );
};
