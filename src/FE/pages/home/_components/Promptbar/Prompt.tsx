import { MouseEventHandler, useContext, useEffect, useState } from 'react';

import { Prompt, PromptSlim } from '@/types/prompt';

import SidebarActionButton from '@/components/Button/SidebarActionButton';
import {
  IconBulbFilled,
  IconCheck,
  IconTrash,
  IconX,
} from '@/components/Icons/index';

import PromptbarContext from './PromptBar.context';
import PromptModal from './PromptModal';

import { getUserPromptDetail } from '@/apis/clientApis';

interface Props {
  prompt: PromptSlim;
}

const PromptComponent = ({ prompt }: Props) => {
  const {
    dispatch: promptDispatch,
    handleUpdatePrompt,
    handleDeletePrompt,
  } = useContext(PromptbarContext);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [promptDetail, setPromptDetail] = useState<Prompt>();

  const handleUpdate = (prompt: Prompt) => {
    handleUpdatePrompt(prompt);
    promptDispatch({ field: 'searchTerm', value: '' });
  };

  const handleDelete: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();

    if (isDeleting) {
      handleDeletePrompt(prompt);
      promptDispatch({ field: 'searchTerm', value: '' });
    }

    setIsDeleting(false);
  };

  const handleCancelDelete: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    setIsDeleting(false);
  };

  const handleOpenDeleteModal: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    setIsDeleting(true);
  };

  const handlePromptDetail = (e: any) => {
    e.stopPropagation();
    getUserPromptDetail(prompt.id).then((data) => {
      setPromptDetail(data);
      setShowModal(true);
    });
  };

  useEffect(() => {
    if (isRenaming) {
      setIsDeleting(false);
    } else if (isDeleting) {
      setIsRenaming(false);
    }
  }, [isRenaming, isDeleting]);

  const getPromptColor = (prompt: PromptSlim) => {
    if (prompt.isSystem) {
      return 'text-green-700';
    } else if (prompt.isDefault) {
      return 'text-blue-700';
    } else {
      return 'text-gray-600';
    }
  };

  return (
    <div className="relative flex items-center">
      <button
        className="flex w-full cursor-pointer items-center gap-3 rounded-lg p-3 text-sm transition-colors duration-200 hover:bg-muted"
        onClick={(e) => {
          handlePromptDetail(e);
        }}
      >
        <IconBulbFilled size={18} className={getPromptColor(prompt)} />

        <div className="relative max-h-5 flex-1 overflow-hidden text-ellipsis whitespace-nowrap break-all pr-4 text-left text-[12.5px] leading-3">
          {prompt.name}
        </div>
      </button>

      {(isDeleting || isRenaming) && (
        <div className="absolute right-1 z-10 flex text-gray-300">
          <SidebarActionButton handleClick={handleDelete}>
            <IconCheck size={18} />
          </SidebarActionButton>

          <SidebarActionButton handleClick={handleCancelDelete}>
            <IconX size={18} />
          </SidebarActionButton>
        </div>
      )}

      {!isDeleting && !isRenaming && (
        <div className="absolute right-1 z-10 flex text-gray-300">
          <SidebarActionButton handleClick={handleOpenDeleteModal}>
            <IconTrash size={18} />
          </SidebarActionButton>
        </div>
      )}

      {showModal && (
        <PromptModal
          prompt={promptDetail!}
          onClose={() => setShowModal(false)}
          onUpdatePrompt={handleUpdate}
        />
      )}
    </div>
  );
};
export default PromptComponent;
