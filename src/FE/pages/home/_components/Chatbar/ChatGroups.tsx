import { useContext, useRef } from 'react';

import { chatsGroupByUpdatedAt, isUnGroupChat } from '@/utils/chats';
import { currentISODateString } from '@/utils/date';

import { IChat, UngroupedChatName } from '@/types/chat';
import { IChatGroup } from '@/types/group';

import Folder from '@/components/Folder/Folder';

import { setChatGroup, setChats } from '../../_actions/chat.actions';
import HomeContext from '../../_contexts/home.context';
import Conversations from './Conversations';

import { deleteChatGroup, putChatGroup, putChats } from '@/apis/clientApis';
import { cn } from '@/lib/utils';

interface Props {
  onShowMore?: (groupId: string | null) => void;
}

const ChatGroups = ({ onShowMore }: Props) => {
  const {
    state: { chats, chatGroups },
    chatDispatch,
  } = useContext(HomeContext);

  const groupRefs = useRef<any>({});

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
    const chatGroupList = chatGroups.map((x) =>
      x.id === folder.id ? { ...x, isExpanded: !folder.isExpanded } : x,
    );
    chatDispatch(setChatGroup(chatGroupList));
    folder.id &&
      putChatGroup({ id: folder.id, isExpanded: !folder.isExpanded });
  };

  const handleDeleteGroup = (groupId: string, index: number) => {
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
      groupRefs.current[groupId] = undefined;
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
        className={cn(!isUnGroupChat(chatGroup.id) && 'ml-4 gap-2 border-l')}
      >
        <Conversations
          groupId={chatGroup.id}
          onShowMore={onShowMore}
          chatGroups={groupByUpdatedChats}
        />
      </div>
    );
  };

  const allowDrop = (e: any) => {
    e.preventDefault();
  };

  const dropHandler = (e: any, currentGroup: IChatGroup) => {
    if (e.dataTransfer) {
      handleDrop(e, currentGroup);
      Object.keys(groupRefs.current).forEach((key: string) => {
        if (groupRefs.current[key]) {
          groupRefs.current[key].style.background = 'none';
        }
      });
    }
  };

  const highlightDrop = (groupId: string) => {
    Object.keys(groupRefs.current).forEach((key: string) => {
      if (key === groupId) {
        groupRefs.current[key].style.background = 'hsl(var(--muted))';
      } else if (groupRefs.current[key]) {
        groupRefs.current[key].style.background = 'none';
      }
    });
  };

  return (
    <div className="flex w-full flex-col pt-2 bg-m">
      {chatGroups.map((group, index) => {
        const isAllChatGroup = isUnGroupChat(group.id);
        return (
          <div
            key={'chat-group-' + index}
            className="rounded-md"
            ref={(el) =>
              (groupRefs.current[group.id || UngroupedChatName] = el)
            }
            onDrop={(e) => dropHandler(e, group)}
            onDragOver={allowDrop}
            onDragEnter={() => {
              highlightDrop(group.id || UngroupedChatName);
            }}
          >
            {isAllChatGroup ? (
              <div className="pt-1">{ChatGroupsRender(group)}</div>
            ) : (
              <Folder
                showActions={!isAllChatGroup}
                defaultOpen={group.isExpanded}
                currentFolder={group}
                onClickGroup={handleClickGroup}
                onDeleteGroup={(id: string) => {
                  handleDeleteGroup(id, index);
                }}
                onRenameGroup={handRenameGroup}
                folderComponent={ChatGroupsRender(group)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ChatGroups;
