import {
  IconCheck,
  IconMessage,
  IconMessageShare,
  IconPencil,
  IconTrash,
  IconX,
} from '@/components/Icons/index';
import {
  KeyboardEvent,
  MouseEventHandler,
  useContext,
  useEffect,
  useState,
} from 'react';

import SidebarActionButton from '../SidebarActionButton';
import ChatbarContext from '@/components/Chatbar/Chatbar.context';
import { HomeContext } from '@/pages/home/home';
import { ChatResult, deleteChats, putChats } from '@/apis/userService';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';

interface Props {
  chat: ChatResult;
}

export const ConversationComponent = ({ chat }: Props) => {
  const { t } = useTranslation('chat');
  const {
    state: { selectChatId, messageIsStreaming },
    handleSelectChat,
    handleUpdateChat,
  } = useContext(HomeContext);

  const { handleDeleteChat } = useContext(ChatbarContext);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isChanging, setTitleChanging] = useState(false);
  const [title, setTitle] = useState('');

  const handleEnterDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      selectChatId && handleChangeTitle(selectChatId);
    }
  };

  const handleChangeTitle = (selectChatId: string) => {
    if (title.trim().length > 0) {
      putChats({ id: selectChatId!, title }).then(() => {
        handleUpdateChat(selectChatId, { title });
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

  const handleOpenChangeTitleModal: MouseEventHandler<HTMLButtonElement> = (
    e
  ) => {
    e.stopPropagation();
    setTitleChanging(true);
    selectChatId && setTitle(chat.title);
  };
  const handleOpenDeleteModal: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    setIsDeleting(true);
  };

  useEffect(() => {
    if (isChanging) {
      setIsDeleting(false);
    } else if (isDeleting) {
      setTitleChanging(false);
    }
  }, [isChanging, isDeleting]);

  return (
    <div className='relative flex items-center'>
      {isChanging && selectChatId === chat.id ? (
        <div className='flex w-full items-center gap-3 rounded-lg text-black dark:text-white dark:bg-[#343541]/90 p-3'>
          <IconMessage size={18} />
          <input
            className='mr-12 flex-1 overflow-hidden overflow-ellipsis border-neutral-400 bg-transparent text-left text-[12.5px] leading-3 outline-none text-black dark:text-white'
            type='text'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleEnterDown}
            autoFocus
          />
        </div>
      ) : (
        <button
          className={`flex w-full cursor-pointer items-center gap-3 rounded-lg p-3 text-sm transition-colors duration-200 hover:bg-[#cdcdcd] hover:dark:bg-[#343541] ${
            messageIsStreaming ? 'disabled:cursor-not-allowed' : ''
          } ${
            selectChatId === chat.id ? 'bg-[#ececec] dark:bg-[#343541]/90' : ''
          }`}
          onClick={() => handleSelectChat(chat.id)}
          disabled={messageIsStreaming}
        >
          {chat.isShared ? (
            <IconMessageShare size={18} />
          ) : (
            <IconMessage size={18} />
          )}
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
        <div className='absolute right-1 z-10 flex text-gray-300'>
          <SidebarActionButton handleClick={handleConfirm}>
            <IconCheck size={18} />
          </SidebarActionButton>
          <SidebarActionButton handleClick={handleCancel}>
            <IconX size={18} />
          </SidebarActionButton>
        </div>
      )}

      {selectChatId === chat.id && !isDeleting && !isChanging && (
        <div className='absolute right-1 z-10 flex text-gray-300'>
          <SidebarActionButton handleClick={handleOpenChangeTitleModal}>
            <IconPencil size={18} />
          </SidebarActionButton>
          <SidebarActionButton handleClick={handleOpenDeleteModal}>
            <IconTrash size={18} />
          </SidebarActionButton>
        </div>
      )}
    </div>
  );
};
