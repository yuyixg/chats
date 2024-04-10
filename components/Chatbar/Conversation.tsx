import {
  IconCheck,
  IconMessage,
  IconMessageShare,
  IconPencil,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import {
  DragEvent,
  KeyboardEvent,
  MouseEventHandler,
  useContext,
  useEffect,
  useState,
} from 'react';

import { Conversation } from '@/types/chat';

import SidebarActionButton from '../SidebarActionButton';
import ChatbarContext from '@/components/Chatbar/Chatbar.context';
import { HomeContext } from '@/pages/home/home';
import { deleteUserMessages, putUserMessages } from '@/apis/userService';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';

interface Props {
  conversation: Conversation;
}

export const ConversationComponent = ({ conversation }: Props) => {
  const { t } = useTranslation('chat');
  const {
    state: { selectedConversation, messageIsStreaming },
    handleSelectConversation,
    handleUpdateConversation,
  } = useContext(HomeContext);

  const { handleDeleteConversation } = useContext(ChatbarContext);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  const handleEnterDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      selectedConversation && handleRename(selectedConversation);
    }
  };

  const handleRename = (conversation: Conversation) => {
    if (renameValue.trim().length > 0) {
      handleUpdateConversation(conversation, [
        {
          key: 'name',
          value: renameValue,
        },
      ] as any);
      setRenameValue('');
      setIsRenaming(false);
    }
  };

  const handleConfirm: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    if (isDeleting) {
      handleDeleteConversation(conversation);
      deleteUserMessages(conversation.id).then(() => {
        toast.success(t('Delete successful'));
      });
    } else if (isRenaming) {
      handleRename(conversation);
      const { id, name } = conversation;
      putUserMessages(id, name).then(() => {
        toast.success(t('Save successful'));
      });
    }
    setIsDeleting(false);
    setIsRenaming(false);
  };

  const handleCancel: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    setIsDeleting(false);
    setIsRenaming(false);
  };

  const handleOpenRenameModal: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    setIsRenaming(true);
    selectedConversation && setRenameValue(selectedConversation.name);
  };
  const handleOpenDeleteModal: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    setIsDeleting(true);
  };

  useEffect(() => {
    if (isRenaming) {
      setIsDeleting(false);
    } else if (isDeleting) {
      setIsRenaming(false);
    }
  }, [isRenaming, isDeleting]);

  return (
    <div className='relative flex items-center'>
      {isRenaming && selectedConversation?.id === conversation.id ? (
        <div className='flex w-full items-center gap-3 rounded-lg text-black dark:text-white dark:bg-[#343541]/90 p-3'>
          <IconMessage size={18} />
          <input
            className='mr-12 flex-1 overflow-hidden overflow-ellipsis border-neutral-400 bg-transparent text-left text-[12.5px] leading-3 outline-none text-black dark:text-white'
            type='text'
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={handleEnterDown}
            autoFocus
          />
        </div>
      ) : (
        <button
          className={`flex w-full cursor-pointer items-center gap-3 rounded-lg p-3 text-sm transition-colors duration-200 hover:bg-[#cdcdcd] hover:dark:bg-[#343541] ${
            messageIsStreaming ? 'disabled:cursor-not-allowed' : ''
          } ${
            selectedConversation?.id === conversation.id
              ? 'bg-[#ececec] dark:bg-[#343541]/90'
              : ''
          }`}
          onClick={() => handleSelectConversation(conversation)}
          disabled={messageIsStreaming}
        >
          {conversation.isShared ? (
            <IconMessageShare size={18} />
          ) : (
            <IconMessage size={18} />
          )}
          <div
            className={`relative max-h-5 flex-1 overflow-hidden text-ellipsis whitespace-nowrap break-all text-left text-[12.5px] leading-4 ${
              selectedConversation?.id === conversation.id ? 'pr-12' : 'pr-1'
            }`}
          >
            {conversation.name}
          </div>
        </button>
      )}

      {(isDeleting || isRenaming) &&
        selectedConversation?.id === conversation.id && (
          <div className='absolute right-1 z-10 flex text-gray-300'>
            <SidebarActionButton handleClick={handleConfirm}>
              <IconCheck size={18} />
            </SidebarActionButton>
            <SidebarActionButton handleClick={handleCancel}>
              <IconX size={18} />
            </SidebarActionButton>
          </div>
        )}

      {selectedConversation?.id === conversation.id &&
        !isDeleting &&
        !isRenaming && (
          <div className='absolute right-1 z-10 flex text-gray-300'>
            <SidebarActionButton handleClick={handleOpenRenameModal}>
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
