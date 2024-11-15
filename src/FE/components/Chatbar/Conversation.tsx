import {
  KeyboardEvent,
  MouseEventHandler,
  useContext,
  useEffect,
  useState,
} from 'react';
import toast from 'react-hot-toast';

import useTranslation from '@/hooks/useTranslation';

import { ChatResult } from '@/types/clientApis';
import { DBModelProvider } from '@/types/model';

import { HomeContext } from '@/pages/home/home';

import SidebarActionButton from '@/components/Button/SidebarActionButton';
import { SharedMessageModal } from '@/components/Chat/SharedMessageModal';
import ChatIcon from '@/components/ChatIcon/ChatIcon';
import ChatbarContext from '@/components/Chatbar/Chatbar.context';
import {
  IconCheck,
  IconDots,
  IconPencil,
  IconShare,
  IconTrash,
  IconX,
} from '@/components/Icons/index';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { deleteChats, putChats } from '@/apis/clientApis';

interface Props {
  chat: ChatResult;
}

export const ConversationComponent = ({ chat }: Props) => {
  const { t } = useTranslation();
  const {
    state: {
      selectChat: { id: selectChatId } = { id: undefined },
      messageIsStreaming,
      chats,
    },
    handleSelectChat,
    handleUpdateChat,
  } = useContext(HomeContext);

  const { handleDeleteChat } = useContext(ChatbarContext);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isChanging, setTitleChanging] = useState(false);
  const [title, setTitle] = useState('');
  const [isShare, setIsShare] = useState(false);

  const handleEnterDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      selectChatId && handleChangeTitle(selectChatId);
    }
  };

  const handleChangeTitle = (chatId: string) => {
    if (title.trim().length > 0) {
      putChats(chatId, { title }).then(() => {
        handleUpdateChat(chats, chatId, { title });
        toast.success(t('Save successful'));
        setTitle('');
        setTitleChanging(false);
      });
    }
  };

  const handleConfirm: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    if (isDeleting) {
      deleteChats(chat.id).then(() => {
        handleDeleteChat(chat.id);
        toast.success(t('Delete successful'));
      });
    } else if (isChanging) {
      handleChangeTitle(chat.id);
    }
    setIsDeleting(false);
    setTitleChanging(false);
  };

  const handleCancel: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    setIsDeleting(false);
    setTitleChanging(false);
  };

  const handleOpenChangeTitleModal: MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();
    setTitleChanging(true);
    selectChatId && setTitle(chat.title);
  };
  const handleOpenDeleteModal: MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();
    setIsDeleting(true);
  };
  const handleOpenShareModal: MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();
    setIsShare(true);
  };

  const handleSharedMessage = (isShared: boolean) => {
    handleUpdateChat(chats, selectChatId!, { isShared });
  };

  useEffect(() => {
    if (isChanging) {
      setIsDeleting(false);
    } else if (isDeleting) {
      setTitleChanging(false);
    }
  }, [isChanging, isDeleting]);

  return (
    <div className="relative flex items-center">
      {isChanging && selectChatId === chat.id ? (
        <div className="flex w-full items-center gap-2 rounded-lg text-black dark:text-white dark:bg-[#262630]/90 p-3">
          <ChatIcon
            isShard={chat.isShared}
            provider={DBModelProvider[chat.modelProvider]}
          />
          <input
            className="mr-12 flex-1 overflow-hidden overflow-ellipsis border-neutral-400 bg-transparent text-left text-[12.5px] leading-3 outline-none text-black dark:text-white"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleEnterDown}
            autoFocus
          />
        </div>
      ) : (
        <button
          className={`flex w-full cursor-pointer items-center gap-2 rounded-lg p-3 text-sm transition-colors duration-200 hover:bg-[#cdcdcd] hover:dark:bg-[#262630] ${
            messageIsStreaming ? 'disabled:cursor-not-allowed' : ''
          } ${
            selectChatId === chat.id ? 'bg-[#ececec] dark:bg-[#262630]/90' : ''
          }`}
          onClick={() => handleSelectChat(chat)}
          disabled={messageIsStreaming}
        >
          <ChatIcon
            isShard={chat.isShared}
            provider={DBModelProvider[chat.modelProvider]}
          />
          <div
            className={`relative max-h-5 flex-1 overflow-hidden text-ellipsis whitespace-nowrap break-all text-left text-[12.5px] leading-4 ${
              selectChatId === chat.id ? 'pr-12' : 'pr-1'
            }`}
          >
            {chat.title}
          </div>
        </button>
      )}

      {(isDeleting || isChanging) && selectChatId === chat.id && (
        <div className="absolute right-1 z-10 flex text-gray-300">
          <SidebarActionButton handleClick={handleConfirm}>
            <IconCheck size={18} />
          </SidebarActionButton>
          <SidebarActionButton handleClick={handleCancel}>
            <IconX size={18} />
          </SidebarActionButton>
        </div>
      )}

      {selectChatId === chat.id && !isDeleting && !isChanging && (
        <div className="absolute right-2 z-10 flex text-gray-300">
          <DropdownMenu>
            <DropdownMenuTrigger disabled={messageIsStreaming}>
              <Button variant="ghost" className="p-[6px] m-0 h-auto">
                <IconDots size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-42">
              <DropdownMenuItem
                className="flex justify-start gap-2"
                onClick={handleOpenChangeTitleModal}
              >
                <IconPencil size={18} />
                {t('Edit')}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex justify-start gap-2"
                onClick={handleOpenShareModal}
              >
                <IconShare size={18} />
                {t('Share')}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex justify-start gap-2"
                onClick={handleOpenDeleteModal}
              >
                <IconTrash size={18} />
                {t('Delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {isShare && (
        <SharedMessageModal
          isOpen={isShare}
          onClose={() => {
            setIsShare(false);
          }}
          chat={chats.find((x) => x.id === selectChatId)!}
          onShareChange={handleSharedMessage}
        />
      )}
    </div>
  );
};
