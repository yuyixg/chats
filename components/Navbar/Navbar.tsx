import { IconPlus } from '@tabler/icons-react';
import { FC } from 'react';

import { Conversation } from '@/types/chat';

interface Props {
  selectedConversation: Conversation;
  onNewConversation: () => void;
  hasModel: () => boolean;
}

export const Navbar: FC<Props> = ({
  selectedConversation,
  onNewConversation,
  hasModel,
}) => {
  return (
    <nav className='flex w-full justify-between bg-[#202123] py-3 px-4'>
      <div className='mr-4'></div>

      <div className='max-w-[240px] overflow-hidden text-ellipsis whitespace-nowrap'>
        {selectedConversation.name}
      </div>

      {hasModel() && (
        <IconPlus
          className='cursor-pointer hover:text-neutral-400'
          onClick={onNewConversation}
        />
      )}
    </nav>
  );
};
